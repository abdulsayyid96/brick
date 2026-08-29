{
    autoDetectedDuration > 0 ? (
        <div
            className="auto-detected-badge"
            title={`Auto-detected: ${formatParsedDuration(autoDetectedDuration)}. Enter duration manually to override.`}
        >
            <span>⚡ {formatParsedDuration(autoDetectedDuration)}</span>
        </div>
    ) : (
    <>
        <input
            className="duration-field"
            type="number"
            min="0"
            max="23"
            placeholder="0"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            onKeyDown={handleKeyDown}
        />
        <span className="duration-sep">h</span>
        <input
            className="duration-field"
            type="number"
            min="0"
            max="59"
            placeholder="0"
            value={mins}
            onChange={(e) => setMins(e.target.value)}
            onKeyDown={handleKeyDown}
        />
        <span className="duration-sep">m</span>
    </>
)
}