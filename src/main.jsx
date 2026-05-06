import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(e) { return { error: e } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'monospace', color: '#ff5555', background: '#282a36', minHeight: '100vh' }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 4, marginBottom: 16, color: '#6272a4' }}>App Error</div>
          <div style={{ fontSize: 13, marginBottom: 8 }}>{this.state.error.message}</div>
          <div style={{ fontSize: 11, color: '#6272a4', whiteSpace: 'pre-wrap' }}>{this.state.error.stack?.slice(0, 500)}</div>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 24, padding: '8px 16px', background: '#bd93f9', color: '#282a36', border: 'none', fontFamily: 'monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, cursor: 'pointer' }}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// Unregister any leftover service workers from previous PWA builds
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(r => r.unregister())
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
)
