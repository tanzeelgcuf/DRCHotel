import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="error-boundary">
          <h2>Quelque chose s'est mal passé.</h2>
          <p>Nous sommes désolés pour ce problème. Veuillez rafraîchir la page ou réessayer plus tard.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="refresh-button"
          >
            Rafraîchir la page
          </button>
          {this.props.showDetails && this.state.error && (
            <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>
              <summary>Détails de l'erreur</summary>
              {this.state.error.toString()}
              <br />
              {this.state.errorInfo.componentStack}
            </details>
          )}
          <style jsx>{`
            .error-boundary {
              padding: 20px;
              margin: 20px;
              border: 1px solid #f5c6cb;
              border-radius: 4px;
              color: #721c24;
              background-color: #f8d7da;
              text-align: center;
            }
            
            .refresh-button {
              margin-top: 15px;
              padding: 8px 16px;
              background-color: #0d6efd;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            }
            
            .refresh-button:hover {
              background-color: #0b5ed7;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;