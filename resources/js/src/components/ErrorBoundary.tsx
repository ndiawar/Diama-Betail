import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Oups ! Une erreur s'est produite
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                L'application a rencontré un problème inattendu. Veuillez rafraîchir la page.
                            </p>
                            
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className="text-left text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-3 rounded mb-4">
                                    <summary className="cursor-pointer font-medium mb-2">
                                        Détails de l'erreur (développement)
                                    </summary>
                                    <div className="space-y-2">
                                        <div>
                                            <strong>Erreur:</strong> {this.state.error.message}
                                        </div>
                                        <div>
                                            <strong>Stack:</strong>
                                            <pre className="whitespace-pre-wrap text-xs mt-1">
                                                {this.state.error.stack}
                                            </pre>
                                        </div>
                                        {this.state.errorInfo && (
                                            <div>
                                                <strong>Component Stack:</strong>
                                                <pre className="whitespace-pre-wrap text-xs mt-1">
                                                    {this.state.errorInfo.componentStack}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </details>
                            )}
                            
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="btn btn-primary"
                                >
                                    Rafraîchir la page
                                </button>
                                <button
                                    onClick={() => window.history.back()}
                                    className="btn btn-outline-secondary"
                                >
                                    Retour
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 