import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class AllRpcExceptionsFilter
  implements RpcExceptionFilter<RpcException>
{
  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    const ctx = host.switchToRpc();

    let errorResponse = exception.getError();

    if (typeof errorResponse === 'string') {
      try {
        errorResponse = JSON.parse(errorResponse);
      } catch (e) {
        console.error('Error parsing RPC Exception:', e);
      }
    }

    const statusCode = errorResponse['statusCode'] || 500;
    const message = errorResponse['message'] || 'Internal server error';
    const details = errorResponse['details'] || null;

    const response = {
      statusCode: statusCode,
      timestamp: new Date().toISOString(),
      message: message,
      error: message,
      details: details,
    };

    return throwError(() => response);
  }
}
