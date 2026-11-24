function Logo({ subtitle, light = false }) {
    return (
        <div className={`logo ${light ? "logo-light" : ""}`}>
            <div className="logo-mark" aria-hidden="true">
                <i className="bi bi-journal-bookmark-fill"></i>
            </div>
            <div className="logo-text">
                <span className="logo-name">IntelliDocs</span>
                {subtitle && <small>{subtitle}</small>}
            </div>
        </div>
    );
}

export default Logo;
