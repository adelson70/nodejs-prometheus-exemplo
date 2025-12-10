import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from "@nestjs/common";
import { OrdensService } from "./ordens.service";

@Controller('ordens')
export class OrdensController {
    constructor(
        private readonly ordensService: OrdensService
    ) {}

    @Post()
    async create(@Body() createOrdemDto: { descricao: string; status: string; metodo: string; valor: number }) {
        return this.ordensService.create(createOrdemDto);
    }

    @Get()
    async findAll() {
        return this.ordensService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.ordensService.findOne(id);
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateOrdemDto: { descricao?: string; status?: string; metodo?: string; valor?: number }
    ) {
        return this.ordensService.update(id, updateOrdemDto);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.ordensService.delete(id);
        return { message: 'Ordem deletada com sucesso' };
    }
}
