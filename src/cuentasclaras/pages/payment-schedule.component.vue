<template>
  <div class="cronograma-wrapper">
    <h2 class="title">Cronograma de Pagos - Método Alemán</h2>
    <button class="btn btn-success" @click="exportarExcel">Descargar Excel</button>
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
  <div class="boton-volver-wrapper">
    <button class="btn btn-outline" @click="goToDataBonus">Volver a ingresar datos</button>
  </div>

</template>

<script>
import { useBonoStore } from '@/stores/bono';
import { format, addDays ,addMonths } from 'date-fns';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default {
  name: 'PaymentSchedule',
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
      const A = (this.valorNominal / N);
      const TES = this.tasaEfectiva;
      const frecuenciaDias = this.frecuenciaMeses * 30;

      const flujoEmisor0 = this.valorComercial - this.costesInicialesEmisor;
      const flujoBonista0 = -(this.valorComercial + this.costesInicialesBonista);

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

      let saldo = this.valorNominal;
      let fechaAnterior = new Date(this.fechaEmisionDate); // cuota 0

      for (let i = 1; i <= N; i++) {
        const interes = -saldo * TES;
        const amort = -A;
        const cuota = interes + amort;
        const escudo = -interes * this.impuestoRenta / 100;
        const prima = (i === N) ? -this.valorNominal * this.primaPorcentaje / 100 : 0;

        // Sumar días (frecuencia del cupón)
        const nuevaFecha = addDays(fechaAnterior, frecuenciaDias);
        fechaAnterior = new Date(nuevaFecha); // guardar para la siguiente iteración

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

        saldo -= A;
      }
    },
    exportarExcel() {
      const wsData = [
        [
          'Nº', 'Fecha', 'Bono', 'Interés', 'Cuota', 'Amortización',
          'Prima', 'Escudo', 'Flujo Emisor', 'Flujo Emisor c/Escudo',
          'Flujo Bonista', 'Flujo Act.', 'FA x Plazo', 'Factor p/Convexidad'
        ]
      ];

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
    goToDataBonus() {
      this.$router.push({ name: 'data-bonus' });
    }

  }
};
</script>

<style scoped>
.cronograma-wrapper {
  padding: 1rem;
  font-family: 'Inter', sans-serif;
}
.title {
  margin-bottom: 1rem;
  font-size: 20px;
  font-weight: 600;
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
.btn-success {
  background-color: #198754;
  color: white;
  border: none;
}
.boton-volver-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.btn-outline {
  border: 1px solid #365e73;
  background-color: white;
  color: #365e73;
  padding: 0.6rem 1.5rem;
  font-weight: 500;
  border-radius: 5px;
  cursor: pointer;
}

</style>

