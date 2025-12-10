import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';
@Injectable()
export class MetricsService {
    private readonly register: client.Registry;
    private readonly httpRequestDurationMicroseconds: client.Histogram;
    private readonly httpRequestCount: client.Counter;
    private readonly businessMetrics: Record<string, client.Counter>;
    private readonly usuariosEditados: client.Counter;
    private readonly usuariosDeletados: client.Counter;
    private readonly ordensEditadas: client.Counter;
    private readonly ordensDeletadas: client.Counter;
    private readonly usuariosTotal: client.Gauge;
    private readonly ordensTotal: client.Gauge;
    private readonly operacoesTempo: client.Histogram;

    constructor() {
        this.register = new client.Registry();
        client.collectDefaultMetrics({ register: this.register });

        this.httpRequestDurationMicroseconds = new client.Histogram({
            name: 'http_request_duration_microseconds',
            help: 'Duração das requisições HTTP em microssegundos',
            labelNames: ['method', 'route', 'status'],
            buckets: [0.1, 0.5, 1, 2.5, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000]
        });

        this.httpRequestCount = new client.Counter({
            name: 'http_request_count',
            help: 'Contagem de requisições HTTP',
            labelNames: ['method', 'route', 'status'],
        });

        this.businessMetrics = {
            usuariosCriados: new client.Counter({
                name: 'usuarios_criados',
                help: 'Contagem de usuários criados',
            }),
            ordensCriadas: new client.Counter({
                name: 'ordens_criadas',
                help: 'Contagem de ordens criadas',
                labelNames: ['status', 'metodo'],
            }),
        };

        this.usuariosEditados = new client.Counter({
            name: 'usuarios_editados',
            help: 'Contagem de usuários editados',
        });

        this.usuariosDeletados = new client.Counter({
            name: 'usuarios_deletados',
            help: 'Contagem de usuários deletados',
        });

        this.ordensEditadas = new client.Counter({
            name: 'ordens_editadas',
            help: 'Contagem de ordens editadas',
            labelNames: ['status', 'metodo'],
        });

        this.ordensDeletadas = new client.Counter({
            name: 'ordens_deletadas',
            help: 'Contagem de ordens deletadas',
            labelNames: ['status'],
        });

        this.usuariosTotal = new client.Gauge({
            name: 'usuarios_total',
            help: 'Total de usuários no sistema',
        });

        this.ordensTotal = new client.Gauge({
            name: 'ordens_total',
            help: 'Total de ordens no sistema',
            labelNames: ['status'],
        });

        this.operacoesTempo = new client.Histogram({
            name: 'operacoes_tempo',
            help: 'Tempo de execução das operações CRUD em milissegundos',
            labelNames: ['operacao', 'entidade'],
            buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000]
        });

        this.register.registerMetric(this.httpRequestDurationMicroseconds);
        this.register.registerMetric(this.httpRequestCount);
        Object.values(this.businessMetrics).forEach(metric => this.register.registerMetric(metric));
        this.register.registerMetric(this.usuariosEditados);
        this.register.registerMetric(this.usuariosDeletados);
        this.register.registerMetric(this.ordensEditadas);
        this.register.registerMetric(this.ordensDeletadas);
        this.register.registerMetric(this.usuariosTotal);
        this.register.registerMetric(this.ordensTotal);
        this.register.registerMetric(this.operacoesTempo);
    }

    getMetrics(): Promise<string> {
        return this.register.metrics();
    }

    getRegister(): client.Registry {
        return this.register;
    }

    incrementHttpRequestCount(method: string, route: string, status: number) {
        this.httpRequestCount.inc({ method, route, status: String(status) });
    }

    observeHttpRequestDuration(method: string, route: string, code: number, duration: number) {
        this.httpRequestDurationMicroseconds.labels(method, route, String(code)).observe(duration);
    }

    incrementUsuariosCriados() {
        const metric = this.businessMetrics.usuariosCriados;
        metric.inc();
    }

    incrementOrdensCriadas(status: string, metodo: string) {
        const metric = this.businessMetrics.ordensCriadas;
        metric.inc({ status, metodo });
    }

    incrementUsuariosEditados() {
        this.usuariosEditados.inc();
    }

    incrementUsuariosDeletados() {
        this.usuariosDeletados.inc();
    }

    incrementOrdensEditadas(status: string, metodo: string) {
        this.ordensEditadas.inc({ status, metodo });
    }

    incrementOrdensDeletadas(status: string) {
        this.ordensDeletadas.inc({ status });
    }

    setUsuariosTotal(total: number) {
        this.usuariosTotal.set(total);
    }

    setOrdensTotal(status: string, total: number) {
        this.ordensTotal.set({ status }, total);
    }

    observeOperacaoTempo(operacao: string, entidade: string, tempo: number) {
        this.operacoesTempo.observe({ operacao, entidade }, tempo);
    }
      
}