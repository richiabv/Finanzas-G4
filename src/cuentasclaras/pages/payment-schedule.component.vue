<template>
  <ToolBarComponent />

  <div class="cronograma-wrapper">
    <div class="header-row">
      <div class="left-actions">
        <span class="back-link" @click="goToResults">
          <span class="material-symbols-outlined">arrow_back</span>
          Regresar a Resultados
        </span>
        <h2 class="title">Cronograma de pago</h2>
      </div>

      <div class="right-actions">
        <button class="download-btn" @click="descargarYGuardar">
          <span class="material-symbols-outlined">download</span>
          Descargar cronograma
        </button>
        <button class="logout-btn" @click="logout">
          <span class="material-symbols-outlined">logout</span>
          Cerrar sesión
        </button>
      </div>
    </div>

    <table class="cronograma-table">
      <thead>
      <tr>
        <th>Nº</th>
        <th>Fecha</th>
        <th>Bono</th>
        <th>Interés</th>
        <th>Cuota</th>
        <th>Amortización</th>
        <th>Prima</th>
        <th>Escudo</th>
        <th>Flujo Emisor</th>
        <th>Flujo Emisor c/Escudo</th>
        <th>Flujo Bonista</th>
        <th>Flujo Act.</th>
        <th>FA x Plazo</th>
        <th>Factor p/Convexidad</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(fila, i) in cronograma" :key="i">
        <td>{{ i }}</td>
        <td>{{ fila.fecha }}</td>
        <td>{{ fila.bono }}</td>
        <td>{{ fila.interes }}</td>
        <td>{{ fila.cuota }}</td>
        <td>{{ fila.amortizacion }}</td>
        <td>{{ fila.prima }}</td>
        <td>{{ fila.escudo }}</td>
        <td>{{ fila.flujoEmisor }}</td>
        <td>{{ fila.flujoEmisorEscudo }}</td>
        <td>{{ fila.flujoBonista }}</td>
        <td>{{ fila.flujoActual }}</td>
        <td>{{ fila.faPlazo }}</td>
        <td>{{ fila.factorConvexidad }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getDoc, doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { db } from '@/firebase';
import { useBonoStore } from '@/stores/bono';
import { format, addDays } from 'date-fns';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ToolBarComponent from '@/public/tool-bar-component.vue';

const route = useRoute();
const router = useRouter();
const bonoStore = useBonoStore();
const cargaId = route.query.cargaId;
const cronograma = ref([]);

const datos = computed(() => bonoStore.datosBono);
const costes = computed(() => bonoStore.datosCostes);

const goToResults = () => router.push({ name: 'bonus-result' });

const logout = () => {
  const auth = getAuth();
  signOut(auth).then(() => router.push({ name: 'login' })).catch(console.error);
};

const exportarExcel = () => {
  const wsData = [[
    'Nº', 'Fecha', 'Bono', 'Interés', 'Cuota', 'Amortización',
    'Prima', 'Escudo', 'Flujo Emisor', 'Flujo Emisor c/Escudo',
    'Flujo Bonista', 'Flujo Act.', 'FA x Plazo', 'Factor p/Convexidad']];
  cronograma.value.forEach((fila, i) => {
    wsData.push([
      i, fila.fecha, fila.bono, fila.interes, fila.cuota, fila.amortizacion,
      fila.prima, fila.escudo, fila.flujoEmisor, fila.flujoEmisorEscudo,
      fila.flujoBonista, fila.flujoActual, fila.faPlazo, fila.factorConvexidad
    ]);
  });
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cronograma');
  const blob = new Blob([XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })], {
    type: 'application/octet-stream'
  });
  saveAs(blob, 'cronograma_pago.xlsx');
};

const descargarYGuardar = async () => {
  exportarExcel();
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;
  const docData = {
    userId: user.uid,
    fechaGuardado: serverTimestamp(),
    nombre: `Cronograma ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
    inputDatos: datos.value,
    costes: costes.value,
    cronograma: cronograma.value
  };
  await addDoc(collection(db, 'cronogramas'), docData);
};

const cargarDesdeFirestore = async (id) => {
  try {
    const snap = await getDoc(doc(db, 'cronogramas', id));
    if (snap.exists()) cronograma.value = snap.data().cronograma;
  } catch (err) {
    console.error(err);
  }
};

const generarCronograma = () => {
  const N = (parseInt(datos.value.anios || '0') * 12) / ({
    Mensual: 1, Bimestral: 2, Trimestral: 3,
    Cuatrimestral: 4, Semestral: 6, Anual: 12
  }[datos.value.frecuencia] || 1);
  const TES = Math.pow(1 + parseFloat((datos.value.tasaInteres || '0').replace('%','').replace(',','.'))/100, 1/(12/({
    Mensual: 1, Bimestral: 2, Trimestral: 3,
    Cuatrimestral: 4, Semestral: 6, Anual: 12
  }[datos.value.frecuencia] || 1))) - 1;
  const pSegDesMensual = parseFloat((costes.value.pSegDes || '0').replace('%','').replace(',','.')) / 100;
  const pSegDesPer = pSegDesMensual * ({
    Mensual: 1, Bimestral: 2, Trimestral: 3,
    Cuatrimestral: 4, Semestral: 6, Anual: 12
  }[datos.value.frecuencia] || 1) / 30;
  const valorNominal = parseFloat((datos.value.valorNominal || '0').replace(',','.'));
  const valorComercial = parseFloat((datos.value.valorComercial || '0').replace(',','.'));
  const frecuenciaDias = ({ Mensual: 1, Bimestral: 2, Trimestral: 3,
    Cuatrimestral: 4, Semestral: 6, Anual: 12 }[datos.value.frecuencia] || 1) * 30;
  const fechaEmision = new Date(...datos.value.fechaEmision.split('-').map((v,i) => i==1 ? +v-1 : +v));
  const impuestos = parseFloat((datos.value.impuestoRenta || '0').replace('%','').replace(',','.'));
  const primaPorcentaje = parseFloat((costes.value.prima || '0').replace('%','').replace(',','.')) || 0;
  const cok = parseFloat(typeof bonoStore.cokFrecuencia === 'string' ? bonoStore.cokFrecuencia.replace('%','').replace(',','.') : bonoStore.cokFrecuencia) / 100 || 0;
  const diasPorAnio = parseInt(datos.value.dias || '360');

  const ciEmisor = ['estructuracion','colocacion','flotacion','cavali'].reduce((acc,k)=>acc+(parseFloat((costes.value[k]||'0').replace('%','').replace(',','.'))||0),0);
  const ciBonista = ['flotacion','cavali'].reduce((acc,k)=>acc+(parseFloat((costes.value[k]||'0').replace('%','').replace(',','.'))||0),0);

  const saldoInicial = valorNominal;
  const flujoEmisor0 = valorComercial - ((valorComercial * ciEmisor)/100);
  const flujoBonista0 = -(valorComercial + ((valorComercial * ciBonista)/100));

  cronograma.value = [];
  cronograma.value.push({ fecha: format(fechaEmision, 'dd/MM/yyyy'), bono: '', interes: '', cuota: '', amortizacion: '', prima: '', escudo: '', flujoEmisor: flujoEmisor0.toFixed(2), flujoEmisorEscudo: flujoEmisor0.toFixed(2), flujoBonista: flujoBonista0.toFixed(2), flujoActual: '', faPlazo: '', factorConvexidad: '' });

  const r = TES + pSegDesPer;
  const cuota = -saldoInicial * r / (1 - Math.pow(1 + r, -N));
  let saldo = saldoInicial;
  let fechaAnterior = new Date(fechaEmision);

  for (let i = 1; i <= N; i++) {
    const interes = -saldo * TES;
    const segDes = -saldo * pSegDesPer;
    const amort = cuota - interes - segDes;
    const nuevaFecha = addDays(fechaAnterior, frecuenciaDias);
    fechaAnterior = new Date(nuevaFecha);
    const prima = (i === N) ? -valorNominal * primaPorcentaje / 100 : 0;
    const escudo = -interes * impuestos / 100;
    const flujoEmisor = cuota + prima;
    const flujoEmisorEscudo = flujoEmisor + escudo;
    const flujoBonista = -flujoEmisor;
    const flujoActual = flujoBonista / Math.pow(1 + cok, i);
    const faPlazo = flujoActual * i * frecuenciaDias / diasPorAnio;
    const factorConvexidad = flujoActual * i * (i + 1);

    cronograma.value.push({
      fecha: format(nuevaFecha, 'dd/MM/yyyy'),
      bono: saldo.toFixed(2),
      interes: interes.toFixed(2),
      cuota: cuota.toFixed(2),
      amortizacion: amort.toFixed(2),
      prima: prima.toFixed(2),
      escudo: escudo.toFixed(2),
      flujoEmisor: flujoEmisor.toFixed(2),
      flujoEmisorEscudo: flujoEmisorEscudo.toFixed(2),
      flujoBonista: flujoBonista.toFixed(2),
      flujoActual: flujoActual.toFixed(2),
      faPlazo: faPlazo.toFixed(2),
      factorConvexidad: factorConvexidad.toFixed(2)
    });

    saldo = saldo + amort;
  }
};

onMounted(() => {
  if (cargaId) cargarDesdeFirestore(cargaId);
  else generarCronograma();
});
</script>

<style scoped>
.cronograma-wrapper {
  padding: 1.5rem;
  font-family: 'Inter', sans-serif;
  overflow-x: auto;
  max-height: 80vh;
  overflow-y: auto;
}
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1.2rem;
}
.left-actions {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}
.right-actions {
  display: flex;
  gap: 0.8rem;
}
.back-link {
  display: flex;
  align-items: center;
  color: #25617E;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
}
.back-link .material-symbols-outlined {
  font-size: 18px;
  margin-right: 4px;
}
.title {
  font-size: 24px;
  font-weight: 700;
  color: #000;
  margin: 0;
}
.download-btn, .logout-btn {
  border: 2px solid;
  background-color: white;
  padding: 0.6rem 1.2rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}
.download-btn {
  color: #25617E;
  border-color: #25617E;
}
.logout-btn {
  color: #dc3545;
  border-color: #dc3545;
}
.cronograma-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.cronograma-table th,
.cronograma-table td {
  border: 1px solid #ccc;
  padding: 6px 8px;
  text-align: center;
}
.cronograma-table th {
  background-color: #f5f5f5;
  font-weight: 600;
}
</style>