function StatsCard({ icon, title, value, tone = "brown", hint }) {
    return (
        <div className={`stat-card tone-${tone}`}>
            <div className="stat-icon">
                <i className={`bi ${icon}`}></i>
            </div>
            <div>
                <span className="stat-title">{title}</span>
                <strong className="stat-value">{value}</strong>
                {hint && <small className="stat-hint">{hint}</small>}
            </div>
        </div>
    );
}

export default StatsCard;
