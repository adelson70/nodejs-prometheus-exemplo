import { Controller, Get } from "@nestjs/common";
import { OrdensService } from "./ordens.service";

@Controller('ordens')
export class OrdensController {
    constructor(
        private readonly ordensService: OrdensService
    ) {}

    @Get()
    async getOrdens() {
        return "Ordens";
    }
}

