import { Injectable, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { MetricsService } from '../metrics/metrics.service';

export interface Ordem {
    id: number;
    descricao: string;
    status: string;
    metodo: string;
    valor: number;
    createdAt: string;
    updatedAt: string;
}

@Injectable()
export class OrdensService {
    private readonly dataPath = join(process.cwd(), 'data', 'ordens.json');

    constructor(private readonly metricsService: MetricsService) {
        this.ensureDataFile();
    }

    private async ensureDataFile() {
        try {
            await fs.access(this.dataPath);
        } catch {
            const dataDir = join(process.cwd(), 'data');
            try {
                await fs.mkdir(dataDir, { recursive: true });
            } catch {}
            await fs.writeFile(this.dataPath, JSON.stringify([], null, 2), 'utf-8');
        }
    }

    private async readData(): Promise<Ordem[]> {
        try {
            const data = await fs.readFile(this.dataPath, 'utf-8');
            return JSON.parse(data);
        } catch {
            return [];
        }
    }

    private async writeData(data: Ordem[]): Promise<void> {
        await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2), 'utf-8');
        this.updateOrdensTotalMetrics(data);
    }

    private async updateOrdensTotalMetrics(ordens: Ordem[]) {
        const statusCounts: Record<string, number> = {};
        ordens.forEach(ordem => {
            statusCounts[ordem.status] = (statusCounts[ordem.status] || 0) + 1;
        });
        
        Object.entries(statusCounts).forEach(([status, count]) => {
            this.metricsService.setOrdensTotal(status, count);
        });
    }

    async create(createOrdemDto: { descricao: string; status: string; metodo: string; valor: number }): Promise<Ordem> {
        const startTime = Date.now();
        const ordens = await this.readData();
        
        const newId = ordens.length > 0 ? Math.max(...ordens.map(o => o.id)) + 1 : 1;
        const now = new Date().toISOString();
        
        const novaOrdem: Ordem = {
            id: newId,
            descricao: createOrdemDto.descricao,
            status: createOrdemDto.status,
            metodo: createOrdemDto.metodo,
            valor: createOrdemDto.valor,
            createdAt: now,
            updatedAt: now,
        };

        ordens.push(novaOrdem);
        await this.writeData(ordens);

        const duration = Date.now() - startTime;
        this.metricsService.observeOperacaoTempo('create', 'ordens', duration);
        this.metricsService.incrementOrdensCriadas(novaOrdem.status, novaOrdem.metodo);

        return novaOrdem;
    }

    async findAll(): Promise<Ordem[]> {
        const startTime = Date.now();
        const ordens = await this.readData();
        const duration = Date.now() - startTime;
        this.metricsService.observeOperacaoTempo('findAll', 'ordens', duration);
        return ordens;
    }

    async findOne(id: number): Promise<Ordem> {
        const startTime = Date.now();
        const ordens = await this.readData();
        const ordem = ordens.find(o => o.id === id);
        const duration = Date.now() - startTime;
        this.metricsService.observeOperacaoTempo('findOne', 'ordens', duration);
        
        if (!ordem) {
            throw new NotFoundException(`Ordem com ID ${id} não encontrada`);
        }
        
        return ordem;
    }

    async update(id: number, updateOrdemDto: { descricao?: string; status?: string; metodo?: string; valor?: number }): Promise<Ordem> {
        const startTime = Date.now();
        const ordens = await this.readData();
        const index = ordens.findIndex(o => o.id === id);

        if (index === -1) {
            throw new NotFoundException(`Ordem com ID ${id} não encontrada`);
        }

        const ordemAtualizada = {
            ...ordens[index],
            ...updateOrdemDto,
            updatedAt: new Date().toISOString(),
        };

        ordens[index] = ordemAtualizada;
        await this.writeData(ordens);

        const duration = Date.now() - startTime;
        this.metricsService.observeOperacaoTempo('update', 'ordens', duration);
        this.metricsService.incrementOrdensEditadas(ordemAtualizada.status, ordemAtualizada.metodo);

        return ordemAtualizada;
    }

    async delete(id: number): Promise<void> {
        const startTime = Date.now();
        const ordens = await this.readData();
        const index = ordens.findIndex(o => o.id === id);

        if (index === -1) {
            throw new NotFoundException(`Ordem com ID ${id} não encontrada`);
        }

        const ordemDeletada = ordens[index];
        ordens.splice(index, 1);
        await this.writeData(ordens);

        const duration = Date.now() - startTime;
        this.metricsService.observeOperacaoTempo('delete', 'ordens', duration);
        this.metricsService.incrementOrdensDeletadas(ordemDeletada.status);
    }
}
