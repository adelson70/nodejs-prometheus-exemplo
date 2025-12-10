import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../modules/metrics/metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
    constructor(private readonly metricsService: MetricsService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const method = request.method;
        const route = request.route?.path || request.url?.split('?')[0] || 'unknown';
        const startTime = Date.now();

        return next.handle().pipe(
            tap({
                next: () => {
                    const duration = (Date.now() - startTime) * 1000; // converter para microssegundos
                    const status = response.statusCode || 200;
                    this.metricsService.incrementHttpRequestCount(method, route, status);
                    this.metricsService.observeHttpRequestDuration(method, route, status, duration);
                },
                error: (error) => {
                    const duration = (Date.now() - startTime) * 1000; // converter para microssegundos
                    const status = error.status || response.statusCode || 500;
                    this.metricsService.incrementHttpRequestCount(method, route, status);
                    this.metricsService.observeHttpRequestDuration(method, route, status, duration);
                },
            }),
        );
    }
}

