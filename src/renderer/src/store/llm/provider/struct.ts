import { IMessageModel } from 'types/model'
import { CompletionOptions, ModelConfig, StreamOptions } from '../type'

export abstract class BaseModel {
  abstract config: ModelConfig
  abstract completion<T = any>(
    messages: IMessageModel[],
    opts?: CompletionOptions
  ): Promise<[string, T]>
  abstract completionStream(messages: IMessageModel[], opts: StreamOptions): Promise<any>
}
