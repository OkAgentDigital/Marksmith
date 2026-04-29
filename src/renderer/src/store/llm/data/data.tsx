import imageModels from './image-models.json'

export const providerOptions = new Map([
  [
    'openrouter',
    {
      models: [],
      baseUrl: 'https://openrouter.ai/api/v1'
    }
  ]
])

const inputImageModel = new Set(imageModels)
export const isImageModel = (model: string) => {
  if (model.includes('claude') || model.includes('gemini')) {
    return true
  }
  if (model.includes('/')) {
    model = model.split('/').pop()!
  }
  return inputImageModel.has(model)
}
