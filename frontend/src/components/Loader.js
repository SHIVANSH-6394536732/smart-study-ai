function Loader({ text = "Loading..." }) {
    return (
        <div className="loader-wrapper">
            <div className="loader-spinner"></div>
            <p className="loader-text">{text}</p>
        </div>
    );
}

export default Loader;