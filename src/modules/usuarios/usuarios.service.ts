import { Injectable, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { MetricsService } from '../metrics/metrics.service';

export interface Usuario {
    id: number;
    nome: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

@Injectable()
export class UsuariosService {
    private readonly dataPath = join(process.cwd(), 'data', 'usuarios.json');

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

    private async readData(): Promise<Usuario[]> {
        try {
            const data = await fs.readFile(this.dataPath, 'utf-8');
            return JSON.parse(data);
        } catch {
            return [];
        }
    }

    private async writeData(data: Usuario[]): Promise<void> {
        await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2), 'utf-8');
    }

    async create(createUsuarioDto: { nome: string; email: string }): Promise<Usuario> {
        const startTime = Date.now();
        const usuarios = await this.readData();
        
        const newId = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
        const now = new Date().toISOString();
        
        const novoUsuario: Usuario = {
            id: newId,
            nome: createUsuarioDto.nome,
            email: createUsuarioDto.email,
            createdAt: now,
            updatedAt: now,
        };

        usuarios.push(novoUsuario);
        await this.writeData(usuarios);

        const duration = Date.now() - startTime;
        this.metricsService.observeOperacaoTempo('create', 'usuarios', duration);
        this.metricsService.incrementUsuariosCriados();
        this.metricsService.setUsuariosTotal(usuarios.length);

        return novoUsuario;
    }

    async findAll(): Promise<Usuario[]> {
        const startTime = Date.now();
        const usuarios = await this.readData();
        const duration = Date.now() - startTime;
        this.metricsService.observeOperacaoTempo('findAll', 'usuarios', duration);
        // Atualizar métrica de total
        this.metricsService.setUsuariosTotal(usuarios.length);
        return usuarios;
    }

    async findOne(id: number): Promise<Usuario> {
        const startTime = Date.now();
        const usuarios = await this.readData();
        const usuario = usuarios.find(u => u.id === id);
        const duration = Date.now() - startTime;
        this.metricsService.observeOperacaoTempo('findOne', 'usuarios', duration);
        
        if (!usuario) {
            throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
        }
        
        return usuario;
    }

    async update(id: number, updateUsuarioDto: { nome?: string; email?: string }): Promise<Usuario> {
        const startTime = Date.now();
        const usuarios = await this.readData();
        const index = usuarios.findIndex(u => u.id === id);

        if (index === -1) {
            throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
        }

        const usuarioAtualizado = {
            ...usuarios[index],
            ...updateUsuarioDto,
            updatedAt: new Date().toISOString(),
        };

        usuarios[index] = usuarioAtualizado;
        await this.writeData(usuarios);

        const duration = Date.now() - startTime;
        this.metricsService.observeOperacaoTempo('update', 'usuarios', duration);
        this.metricsService.incrementUsuariosEditados();

        return usuarioAtualizado;
    }

    async delete(id: number): Promise<void> {
        const startTime = Date.now();
        const usuarios = await this.readData();
        const index = usuarios.findIndex(u => u.id === id);

        if (index === -1) {
            throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
        }

        usuarios.splice(index, 1);
        await this.writeData(usuarios);

        const duration = Date.now() - startTime;
        this.metricsService.observeOperacaoTempo('delete', 'usuarios', duration);
        this.metricsService.incrementUsuariosDeletados();
        this.metricsService.setUsuariosTotal(usuarios.length);
    }
}
