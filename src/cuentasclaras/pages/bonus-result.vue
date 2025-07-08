<script>
import ResultSection from '@/cuentasclaras/components/result-section.vue';
import { useBonoStore } from '@/stores/bono';
import { format, addMonths } from 'date-fns';
import ToolBarComponent from '@/public/tool-bar-component.vue';

export default {
  name: 'ResultadosBono',
  components: {
    ResultSection,
    ToolBarComponent
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
    frecuenciaMeses() {
      const map = {
        Mensual: 1,
        Bimestral: 2,
        Trimestral: 3,
        Cuatrimestral: 4,
        Semestral: 6,
        Anual: 12
      };
      return map[this.datos.frecuencia] || 1;
    },
    frecuenciaDias() {
      return this.frecuenciaMeses * 30;
    },
    diasCapitalizacion() {
      const map = {
        Mensual: 30,
        Bimestral: 60,
        Trimestral: 90,
        Cuatrimestral: 120,
        Semestral: 180,
        Anual: 360
      };
      return map[this.datos.capitalizacion] || 30;
    },
    numeroPeriodosPorAnio() {
      return 12 / this.frecuenciaMeses;
    },
    totalPeriodos() {
      const anios = parseFloat(this.datos.anios || 0);
      const periodosPorAnio = this.numeroPeriodosPorAnio;
      return (anios * periodosPorAnio).toFixed(2);
    },
    tasaEfectivaAnual() {
      const tipoTasa = this.datos.tipoTasa;
      const tasa = parseFloat(this.datos.tasaInteres) / 100;
      const diasAnio = parseInt(this.datos.dias);
      const diasCap = this.diasCapitalizacion;

      if (tipoTasa === 'Efectiva') return (tasa * 100).toFixed(4) + '%';

      const efectiva = Math.pow(1 + tasa / (diasAnio / diasCap), diasAnio / diasCap) - 1;
      return (efectiva * 100).toFixed(4) + '%';
    },
    tasaEfectivaPeriodo() {
      const diasAnio = parseInt(this.datos.dias);
      const diasFrecuencia = this.frecuenciaDias;
      const tasaAnualEfectiva = parseFloat(this.tasaEfectivaAnual.replace('%', '')) / 100;
      const resultado = Math.pow(1 + tasaAnualEfectiva, diasFrecuencia / diasAnio) - 1;
      return (resultado * 100).toFixed(4) + '%';
    },
    cokFrecuencia() {
      const value = this.bonoStore.cokFrecuencia;
      return typeof value === 'string' ? value : value + '%';
    },
    cok() {
      const value = this.bonoStore.cokFrecuencia;
      return parseFloat(typeof value === 'string' ? value.replace('%', '').replace(',', '.') : value) / 100 || 0;
    },
    valorNominal() {
      return parseFloat(this.datos.valorNominal || 0);
    },
    valorComercial() {
      return parseFloat(this.datos.valorComercial || 0);
    },
    primaPorcentaje() {
      return parseFloat((this.costes.prima || '').replace('%', '').replace(',', '.')) || 0;
    },
    impuestoRenta() {
      return parseFloat((this.datos.impuestoRenta || '').replace('%', '').replace(',', '.')) || 0;
    },
    diasPorAnio() {
      return parseInt(this.datos.dias || '360');
    },
    fechaEmisionDate() {
      const [yyyy, mm, dd] = this.datos.fechaEmision.split('-');
      return new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
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
    },
    cronogramaCalculado() {
      const cronograma = [];

      const N = parseInt(this.totalPeriodos);
      const TES = parseFloat(this.tasaEfectivaPeriodo.replace('%', '')) / 100;
      const frecuenciaDias = this.frecuenciaDias;

      const pSegDesMensual = parseFloat((this.costes.pSegDes || '0').replace('%', '').replace(',', '.')) / 100;
      const pSegDesPer = pSegDesMensual * this.frecuenciaMeses / 30;

      const flujoEmisor0 = this.valorComercial - this.costesInicialesEmisor;
      const flujoBonista0 = -(this.valorComercial + this.costesInicialesBonista);

      cronograma.push({
        flujoBonista: flujoBonista0,
        flujoEmisor: flujoEmisor0,
        flujoEmisorEscudo: flujoEmisor0
      });

      const saldoInicial = this.valorNominal;
      const r = TES + pSegDesPer;
      const cuota = -saldoInicial * r / (1 - Math.pow(1 + r, -N));

      let saldo = saldoInicial;

      for (let i = 1; i <= N; i++) {
        const interes = -saldo * TES;
        const segDes = -saldo * pSegDesPer;
        const amort = cuota - interes - segDes;
        const prima = (i === N) ? -this.valorNominal * this.primaPorcentaje / 100 : 0;
        const escudo = -interes * this.impuestoRenta / 100;

        const flujoEmisor = cuota + prima;
        const flujoEmisorEscudo = flujoEmisor + escudo;
        const flujoBonista = -flujoEmisor;

        cronograma.push({
          flujoBonista,
          flujoEmisor,
          flujoEmisorEscudo
        });

        saldo += amort;
      }

      return cronograma;
    },
    precioActualCalculado() {
      const cronograma = this.cronogramaCalculado;

      if (!cronograma || cronograma.length <= 1) return '---';

      // Excluye cuota 0
      const flujos = cronograma.slice(1).map((fila, i) => {
        return fila.flujoBonista / Math.pow(1 + this.cok, i + 1); // i+1 porque inicia desde periodo 1
      });

      const vna = flujos.reduce((acc, val) => acc + val, 0);
      return vna.toFixed(2);
    },
    utilidadCalculada() {
      const cronograma = this.cronogramaCalculado;
      if (!cronograma || cronograma.length === 0) return '---';

      const flujoCero = cronograma[0].flujoBonista || 0;
      const precio = parseFloat(this.precioActualCalculado);
      const utilidad = flujoCero + precio;

      return utilidad.toFixed(2);
    },
    duracionCalculada() {
      const cronograma = this.cronogramaCalculado;
      const frecuenciaDias = this.frecuenciaDias;
      const diasAnio = this.diasPorAnio;

      let sumaFA = 0;
      let sumaFlujosAct = 0;

      for (let i = 1; i < cronograma.length; i++) {
        const flujo = cronograma[i].flujoBonista;
        const actual = flujo / Math.pow(1 + this.cok, i);
        const faPlazo = actual * i * frecuenciaDias / diasAnio;

        sumaFA += faPlazo;
        sumaFlujosAct += actual;
      }

      if (sumaFlujosAct === 0) return '---';

      return (sumaFA / sumaFlujosAct).toFixed(4);
    },
    convexidadCalculada() {
      const cronograma = this.cronogramaCalculado;
      const frecuenciaDias = this.frecuenciaDias;
      const diasAnio = this.diasPorAnio;
      const cok = this.cok;

      let sumaFactorConvexidad = 0;
      let sumaFlujosAct = 0;

      for (let i = 1; i < cronograma.length; i++) {
        const flujo = cronograma[i].flujoBonista;
        const actual = flujo / Math.pow(1 + cok, i);
        const factorConvexidad = actual * i * (i + 1);

        sumaFactorConvexidad += factorConvexidad;
        sumaFlujosAct += actual;
      }

      const denominador = Math.pow(1 + cok, 2) * sumaFlujosAct * Math.pow(diasAnio / frecuenciaDias, 2);
      if (denominador === 0) return '---';

      return (sumaFactorConvexidad / denominador).toFixed(4);
    },

    totalDuracionConvexidad() {
      const d = parseFloat(this.duracionCalculada);
      const c = parseFloat(this.convexidadCalculada);

      if (isNaN(d) || isNaN(c)) return '---';
      return (d + c).toFixed(4);
    },

    duracionModificada() {
      const d = parseFloat(this.duracionCalculada);
      if (isNaN(d)) return '---';

      return (d / (1 + this.cok)).toFixed(4);
    },
    tceaEmisor() {
      const cronograma = this.cronogramaCalculado;
      const flujos = cronograma.map(f => f.flujoEmisor ?? 0);
      const tir = this.calcularTIR(flujos);
      const diasAnio = this.diasPorAnio;
      const frecuencia = this.frecuenciaDias;
      const tasa = Math.pow(1 + tir, diasAnio / frecuencia) - 1;
      return (tasa * 100).toFixed(5) + '%';
    },

    tceaEmisorEscudo() {
      const cronograma = this.cronogramaCalculado;
      const flujos = cronograma.map(f => f.flujoEmisorEscudo ?? 0);
      const tir = this.calcularTIR(flujos);
      const diasAnio = this.diasPorAnio;
      const frecuencia = this.frecuenciaDias;
      const tasa = Math.pow(1 + tir, diasAnio / frecuencia) - 1;
      return (tasa * 100).toFixed(5) + '%';
    },

    treaBonista() {
      const cronograma = this.cronogramaCalculado;
      const flujos = cronograma.map(f => f.flujoBonista ?? 0);
      const tir = this.calcularTIR(flujos);
      const diasAnio = this.diasPorAnio;
      const frecuencia = this.frecuenciaDias;
      const tasa = Math.pow(1 + tir, diasAnio / frecuencia) - 1;
      return (tasa * 100).toFixed(5) + '%';
    },
    estructuracionItems() {
      return [
        { label: 'Frecuencia del cupón', value: this.frecuenciaDias },
        { label: 'Días capitalización', value: this.diasCapitalizacion },
        { label: 'N° Períodos por Año', value: this.numeroPeriodosPorAnio },
        { label: 'N° Total de Períodos', value: this.totalPeriodos },
        { label: 'Tasa efectiva Anual', value: this.tasaEfectivaAnual },
        { label: `Tasa efectiva ${this.datos.frecuencia}`, value: this.tasaEfectivaPeriodo },
        { label: `COK ${this.datos.frecuencia}`, value: this.cokFrecuencia },
        { label: 'Costes Iniciales Emisor', value: this.costesInicialesEmisor.toFixed(2) },
        { label: 'Costes Iniciales Bonista', value: this.costesInicialesBonista.toFixed(2) }
      ];
    },
    precioUtilidadItems() {
      return [
        { label: 'Precio Actual', value: this.precioActualCalculado },
        { label: 'Utilidad / Pérdida', value: this.utilidadCalculada }
      ];
    },
    ratiosItems() {
      return [
        { label: 'Duración', value: this.duracionCalculada },
        { label: 'Convexidad', value: this.convexidadCalculada },
        { label: 'Total', value: this.totalDuracionConvexidad },
        { label: 'Duración modificada', value: this.duracionModificada }
      ];
    },
    indicadoresItems() {
      return [
        { label: 'TCEA Emisor', value: this.tceaEmisor },
        { label: 'TCEA Emisor c/Escudo', value: this.tceaEmisorEscudo },
        { label: 'TREA Bonista', value: this.treaBonista }
      ];
    }
  },
  methods: {
    goToBonusResult() {
      this.$router.push({ name: 'data-bonus' });
    },
    goToSchedulPayment() {
      this.$router.push({ name: 'payment-schedule' });
    },
    calcularTIR(flujos, guess = 0.1) {
      const maxIter = 1000;
      const tol = 1e-7;
      let rate = guess;

      for (let iter = 0; iter < maxIter; iter++) {
        let f = 0;
        let df = 0;
        for (let t = 0; t < flujos.length; t++) {
          f += flujos[t] / Math.pow(1 + rate, t);
          df += -t * flujos[t] / Math.pow(1 + rate, t + 1);
        }

        const newRate = rate - f / df;
        if (Math.abs(newRate - rate) < tol) return newRate;
        rate = newRate;
      }
      return rate;
    }
  }
};
</script>

<template>
  <div class="scroll-wrapper">
    <ToolBarComponent />
    <div class="resultados-container">
      <div class="header-buttons">
        <h2 class="titulo">Resultados</h2>
        <div class="acciones">
          <button class="btn btn-primary" @click="goToSchedulPayment">Ver cronograma de pago</button>
          <button class="btn btn-outline" @click="goToBonusResult">Calcular nuevo bono</button>
        </div>
      </div>

      <ResultSection titulo="Estructuración del bono" :items="estructuracionItems" />
      <ResultSection titulo="Precio Actual y Utilidad" :items="precioUtilidadItems" />
      <ResultSection titulo="Ratios de decisión" :items="ratiosItems" />
      <ResultSection titulo="Indicadores de Rentabilidad" :items="indicadoresItems" />
    </div>
  </div>
</template>

<style scoped>
.scroll-wrapper {
  height: 100vh;
  overflow-y: auto;
}
.resultados-container {
  max-width: 1000px;
  margin: auto;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
}
.header-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.titulo {
  font-size: 24px;
  font-weight: 600;
}
.acciones {
  display: flex;
  gap: 1rem;
}
.btn {
  padding: 0.5rem 1.25rem;
  border-radius: 5px;
  font-weight: 500;
  cursor: pointer;
}
.btn-primary {
  background-color: #365e73;
  color: white;
  border: none;
}
.btn-outline {
  border: 1px solid #365e73;
  background-color: white;
  color: #365e73;
}
</style>
