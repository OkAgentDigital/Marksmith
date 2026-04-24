import React from 'react'

export class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  
  static getDerivedStateFromError(error: Error): {hasError: boolean, error: Error} {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught error:', error)
    console.error('Error info:', errorInfo)
    
    // Log to error tracking service would go here
    // analytics.trackError(error, errorInfo)
  }
  
  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          background: '#fff',
          color: '#f5222d',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️ Application Error</h1>
          <p style={{ fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '600px', textAlign: 'center' }}>
            Something went wrong while loading Marksmith. The application failed to initialize properly.
          </p>
          
          <div style={{
            background: '#fff1f0',
            border: '1px solid #ffa39e',
            padding: '1rem',
            borderRadius: '4px',
            width: '100%',
            maxWidth: '800px',
            marginBottom: '2rem',
            fontFamily: 'monospace',
            fontSize: '0.9rem'
          }}>
            <strong>Error Details:</strong>
            <pre style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>
              {this.state.error?.name}: {this.state.error?.message}
              {this.state.error?.stack && (
                <>
                  <br /><br /><strong>Stack Trace:</strong><br />
                  {this.state.error.stack.split('\n').slice(0, 5).join('\n')}
                </>
              )}
            </pre>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.5rem 1rem',
                background: '#1890ff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#40a9ff'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#1890ff'}
            >
              Reload Application
            </button>
            <button
              onClick={() => {
                localStorage.debug = 'true'
                window.location.reload()
              }}
              style={{
                padding: '0.5rem 1rem',
                background: '#faad14',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Enable Debug Mode
            </button>
          </div>
          
          <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#666' }}>
            If this error persists, please check the browser console for more details.
          </div>
        </div>
      )
    }
    return this.props.children
  }
}