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
        <button class="download-btn" @click="exportarExcel">
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

<script>
import { useBonoStore } from '@/stores/bono';
import { format, addDays } from 'date-fns';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ToolBarComponent from "@/public/tool-bar-component.vue";
import { getAuth, signOut } from 'firebase/auth';

export default {
  name: 'PaymentSchedule',
  components: { ToolBarComponent },
  data() {
    return {
      cronograma: []
    };
  },
  computed: {
    bonoStore() {
      return useBonoStore();
    },
    datos() {
      return this.bonoStore.datosBono;
    },
    costes() {
      return this.bonoStore.datosCostes;
    },
    valorComercial() {
      return parseFloat((this.datos.valorComercial || '').replace(',', '.')) || 0;
    },
    valorNominal() {
      return parseFloat((this.datos.valorNominal || '').replace(',', '.')) || 0;
    },
    primaPorcentaje() {
      return parseFloat((this.costes.prima || '').replace('%', '').replace(',', '.')) || 0;
    },
    frecuenciaMeses() {
      const map = {
        Mensual: 1,
        Bimestral: 2,
        Trimestral: 3,
        Cuatrimestral: 4,
        Semestral: 6,
        Anual: 12
      };
      return map[this.datos.frecuencia] || 0;
    },
    numeroPeriodos() {
      return (parseInt(this.datos.anios || '0') * 12) / this.frecuenciaMeses;
    },
    tasaEfectiva() {
      const tea = parseFloat((this.datos.tasaInteres || '').replace('%', '').replace(',', '.')) / 100;
      const n = this.frecuenciaMeses ? 12 / this.frecuenciaMeses : 1;
      return Math.pow(1 + tea, 1 / n) - 1;
    },
    impuestoRenta() {
      return parseFloat((this.datos.impuestoRenta || '').replace('%', '').replace(',', '.')) || 0;
    },
    cok() {
      const value = this.bonoStore.cokFrecuencia;
      return parseFloat(typeof value === 'string' ? value.replace('%', '').replace(',', '.') : value) / 100 || 0;
    },
    fechaEmisionDate() {
      const [yyyy, mm, dd] = this.datos.fechaEmision.split('-');
      return new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
    },
    diasPorAnio() {
      return parseInt(this.datos.dias || '360');
    },
    costesInicialesEmisor() {
      const { estructuracion, colocacion, flotacion, cavali } = this.costes;
      const total = [estructuracion, colocacion, flotacion, cavali].reduce((sum, val) => {
        const percent = parseFloat((val || '').replace('%', '').replace(',', '.')) || 0;
        return sum + percent;
      }, 0);
      return (this.valorComercial * total) / 100;
    },
    costesInicialesBonista() {
      const { flotacion, cavali } = this.costes;
      const total = [flotacion, cavali].reduce((sum, val) => {
        const percent = parseFloat((val || '').replace('%', '').replace(',', '.')) || 0;
        return sum + percent;
      }, 0);
      return (this.valorComercial * total) / 100;
    }
  },
  mounted() {
    this.generarCronograma();
  },
  methods: {
    generarCronograma() {
      const N = this.numeroPeriodos;
      const TES = this.tasaEfectiva;
      const frecuenciaDias = this.frecuenciaMeses * 30;

      const pSegDesMensual = parseFloat((this.costes.pSegDes || '0').replace('%', '').replace(',', '.')) / 100;
      const pSegDesPer = pSegDesMensual * this.frecuenciaMeses / 30;

      const saldoInicial = this.valorNominal;

      const flujoEmisor0 = this.valorComercial - this.costesInicialesEmisor;
      const flujoBonista0 = -(this.valorComercial + this.costesInicialesBonista);

      this.cronograma = [];

      this.cronograma.push({
        fecha: format(this.fechaEmisionDate, 'dd/MM/yyyy'),
        bono: '',
        interes: '',
        cuota: '',
        amortizacion: '',
        prima: '',
        escudo: '',
        flujoEmisor: flujoEmisor0.toFixed(2),
        flujoEmisorEscudo: flujoEmisor0.toFixed(2),
        flujoBonista: flujoBonista0.toFixed(2),
        flujoActual: '',
        faPlazo: '',
        factorConvexidad: ''
      });

      // Cuota constante método francés
      const r = TES + pSegDesPer;
      const cuota = -saldoInicial * r / (1 - Math.pow(1 + r, -N));

      let saldo = saldoInicial;
      let fechaAnterior = new Date(this.fechaEmisionDate);

      for (let i = 1; i <= N; i++) {
        const interes = -saldo * TES;
        const segDes = -saldo * pSegDesPer;
        const amort = cuota - interes - segDes;

        const nuevaFecha = addDays(fechaAnterior, frecuenciaDias);
        fechaAnterior = new Date(nuevaFecha);

        const prima = (i === N) ? -this.valorNominal * this.primaPorcentaje / 100 : 0;
        const escudo = -interes * this.impuestoRenta / 100;

        const flujoEmisor = cuota + prima;
        const flujoEmisorEscudo = flujoEmisor + escudo;
        const flujoBonista = -flujoEmisor;
        const flujoActual = flujoBonista / Math.pow(1 + this.cok, i);
        const faPlazo = flujoActual * i * frecuenciaDias / this.diasPorAnio;
        const factorConvexidad = flujoActual * i * (i + 1);

        this.cronograma.push({
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

        // ⚠️ Actualizamos saldo correctamente para el próximo periodo
        saldo = saldo + amort;
      }
    },

    exportarExcel() {
      const wsData = [[
        'Nº', 'Fecha', 'Bono', 'Interés', 'Cuota', 'Amortización',
        'Prima', 'Escudo', 'Flujo Emisor', 'Flujo Emisor c/Escudo',
        'Flujo Bonista', 'Flujo Act.', 'FA x Plazo', 'Factor p/Convexidad'
      ]];

      this.cronograma.forEach((fila, i) => {
        wsData.push([
          i,
          fila.fecha,
          fila.bono,
          fila.interes,
          fila.cuota,
          fila.amortizacion,
          fila.prima,
          fila.escudo,
          fila.flujoEmisor,
          fila.flujoEmisorEscudo,
          fila.flujoBonista,
          fila.flujoActual,
          fila.faPlazo,
          fila.factorConvexidad
        ]);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(wsData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Cronograma');

      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array'
      });

      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, 'cronograma_pago.xlsx');
    },

    goToResults() {
      this.$router.push({ name: 'bonus-result' });
    },

    logout() {
      const auth = getAuth();
      signOut(auth)
          .then(() => this.$router.push({ name: 'login' }))
          .catch((error) => console.error('Error al cerrar sesión:', error));
    }
  }
};
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
