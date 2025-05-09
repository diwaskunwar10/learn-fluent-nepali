import { httpClient, ApiCallbacks } from './httpBase';
import { AxiosRequestConfig } from 'axios';

/**
 * Base service class for API services
 */
export class BaseService {
  /**
   * Make a GET request
   * @param url The URL to request
   * @param config Optional axios config
   * @param callbacks Optional callbacks for success, error, and finally
   * @returns Promise with the response data
   */
  protected async get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
    callbacks?: ApiCallbacks<T>
  ): Promise<T> {
    return httpClient.get<T>(url, config, callbacks);
  }

  /**
   * Make a POST request
   * @param url The URL to request
   * @param data The data to send
   * @param config Optional axios config
   * @param callbacks Optional callbacks for success, error, and finally
   * @returns Promise with the response data
   */
  protected async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    callbacks?: ApiCallbacks<T>
  ): Promise<T> {
    return httpClient.post<T>(url, data, config, callbacks);
  }

  /**
   * Make a PUT request
   * @param url The URL to request
   * @param data The data to send
   * @param config Optional axios config
   * @param callbacks Optional callbacks for success, error, and finally
   * @returns Promise with the response data
   */
  protected async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    callbacks?: ApiCallbacks<T>
  ): Promise<T> {
    return httpClient.put<T>(url, data, config, callbacks);
  }

  /**
   * Make a DELETE request
   * @param url The URL to request
   * @param config Optional axios config
   * @param callbacks Optional callbacks for success, error, and finally
   * @returns Promise with the response data
   */
  protected async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
    callbacks?: ApiCallbacks<T>
  ): Promise<T> {
    return httpClient.delete<T>(url, config, callbacks);
  }
}
