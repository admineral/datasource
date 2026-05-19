import type * as Tf from '@tensorflow/tfjs'

export type TfModule = typeof Tf

let loadPromise: Promise<TfModule> | null = null

export function loadTensorFlow(
  onStatus?: (message: string) => void
): Promise<TfModule> {
  if (!loadPromise) {
    loadPromise = (async () => {
      onStatus?.('Downloading TensorFlow.js…')
      const tf = await import('@tensorflow/tfjs')

      onStatus?.('Initializing compute backend (WebGL)…')
      if (tf.getBackend() !== 'webgl') {
        try {
          await tf.setBackend('webgl')
        } catch {
          onStatus?.('WebGL unavailable — using CPU backend')
        }
      }
      await tf.ready()
      onStatus?.('TensorFlow.js ready')
      return tf
    })()
  } else {
    onStatus?.('TensorFlow.js ready')
  }
  return loadPromise
}

export function isTensorFlowLoaded(): boolean {
  return loadPromise !== null
}
