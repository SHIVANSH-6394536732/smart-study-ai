import { Component } from "react";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="card" style={{textAlign: "center"}}>
                    <h2>⚠️ Something went wrong</h2>
                    <p style={{color: "#6b7280"}}>Please refresh the page.</p>
                    <button onClick={() => window.location.reload()}>
                        Refresh
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;