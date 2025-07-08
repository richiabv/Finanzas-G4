    import { defineStore } from 'pinia';

    export const useBonoStore = defineStore('bono', {
        state: () => ({
            datosBono: {
                moneda: '',
                valorComercial: '',
                frecuencia: '',
                tipoTasa: '',
                tasaInteres: '',
                impuestoRenta: '',
                valorNominal: '',
                anios: '',
                dias: '',
                capitalizacion: '',
                tasaDescuento: '',
                fechaEmision: ''
            },
            datosCostes: {
                prima: '',
                estructuracion: '',
                colocacion: '',
                flotacion: '',
                cavali: ''
            }

        }),

        getters: {
            frecuenciaDias(state) {
                const tabla = {
                    Mensual: 30,
                    Bimestral: 60,
                    Trimestral: 90,
                    Cuatrimestral: 120,
                    Semestral: 180,
                    Anual: 360
                };
                return tabla[state.datosBono.frecuencia] || 0;
            },

            diasCapitalizacion(state) {
                const mapa = {
                    Diaria: 1,
                    Quincenal: 15,
                    Mensual: 30,
                    Bimestral: 60,
                    Trimestral: 90,
                    Cuatrimestral: 120,
                    Semestral: 180,
                    Anual: 360
                };
                return mapa[state.datosBono.capitalizacion] || 0;
            },

            numeroPeriodosPorAnio(state) {
                const tablaFrecuencia = {
                    Mensual: 30,
                    Bimestral: 60,
                    Trimestral: 90,
                    Cuatrimestral: 120,
                    Semestral: 180,
                    Anual: 360
                };
                const diasAnio = parseInt(state.datosBono.dias);
                const frecuenciaDias = tablaFrecuencia[state.datosBono.frecuencia];
                if (!diasAnio || !frecuenciaDias) return '---';
                return (diasAnio / frecuenciaDias).toFixed(2);
            },

            cokFrecuencia(state) {
                const tasaDescuento = parseFloat(state.datosBono.tasaDescuento.replace('%', '')) / 100;
                const diasAnio = parseInt(state.datosBono.dias);
                const frecuencia = state.datosBono.frecuencia;

                const tabla = {
                    Mensual: 30,
                    Bimestral: 60,
                    Trimestral: 90,
                    Cuatrimestral: 120,
                    Semestral: 180,
                    Anual: 360
                };
                const frecuenciaDias = tabla[frecuencia];

                if (!tasaDescuento || !diasAnio || !frecuenciaDias) return '---';

                const resultado = (Math.pow(1 + tasaDescuento, frecuenciaDias / diasAnio) - 1) * 100;
                return resultado.toFixed(4) + '%';
            },
            costeEmisor(state) {
                const { estructuracion, colocacion, flotacion, cavali } = state.datosCostes;
                const base = parseFloat((state.datosBono.valorComercial || '').replace(/,/g, ''));
                if (isNaN(base) || base === 0) return '---';

                const total = [estructuracion, colocacion, flotacion, cavali]
                    .map(v => parseFloat((v || '').replace('%', '').replace(',', '.')))
                    .reduce((sum, val) => sum + (isNaN(val) ? 0 : val), 0);

                return (base * total / 100).toFixed(2);
            },


            costeBonista(state) {
                const { flotacion, cavali } = state.datosCostes;
                const base = parseFloat((state.datosBono.valorComercial || '').replace(/,/g, ''));
                if (isNaN(base) || base === 0) return '---';

                const total = [flotacion, cavali]
                    .map(v => parseFloat((v || '').replace('%', '').replace(',', '.')))
                    .reduce((sum, val) => sum + (isNaN(val) ? 0 : val), 0);

                return (base * total / 100).toFixed(2);
            },



        },

        actions: {
            guardarDatos(datos) {
                this.datosBono = { ...datos };
            },
            guardarCostes(costes) {
                this.datosCostes = { ...costes };
            }
        }
    });
