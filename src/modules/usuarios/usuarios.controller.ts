import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from "@nestjs/common";
import { UsuariosService } from "./usuarios.service";

@Controller('usuarios')
export class UsuariosController {
    constructor(
        private readonly usuariosService: UsuariosService
    ) {}

    @Post()
    async create(@Body() createUsuarioDto: { nome: string; email: string }) {
        return this.usuariosService.create(createUsuarioDto);
    }

    @Get()
    async findAll() {
        return this.usuariosService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.usuariosService.findOne(id);
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUsuarioDto: { nome?: string; email?: string }
    ) {
        return this.usuariosService.update(id, updateUsuarioDto);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.usuariosService.delete(id);
        return { message: 'Usuário deletado com sucesso' };
    }
}
