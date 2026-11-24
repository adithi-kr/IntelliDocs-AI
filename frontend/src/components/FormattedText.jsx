import { stripMd } from "../utils/parsers";

/** Render **bold** and `code` inside a single line. */
export function Inline({ text }) {
    const parts = String(text || "").split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

    return <>{parts.map((part, i) => {
        if (/^\*\*[^*]+\*\*$/.test(part)) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (/^`[^`]+`$/.test(part)) {
            return <code key={i}>{part.slice(1, -1)}</code>;
        }
        return part;
    })}</>;
}

/** General purpose renderer for summaries, notes, key points and chat answers. */
export default function FormattedText({ text, emptyText = "Nothing here yet." }) {
    if (!text || !text.trim()) {
        return <p className="empty-content">{emptyText}</p>;
    }

    return (
        <div className="formatted">
            {text.split("\n").map((line, index) => {
                const trimmed = line.trim();

                if (!trimmed) return null;

                if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
                    return <hr key={index} />;
                }

                // "# Heading", "**Whole line bold**" or a short "Label:" line
                const isHashHeading = /^#{1,6}\s/.test(trimmed);
                const isBoldLine = /^\*\*[^*]+\*\*:?$/.test(trimmed);
                const isLabel =
                    trimmed.endsWith(":") &&
                    trimmed.length < 70 &&
                    !/^[•\-*]\s/.test(trimmed);

                if (isHashHeading || isBoldLine || isLabel) {
                    return (
                        <h4 key={index} className="fmt-heading">
                            {stripMd(trimmed).replace(/:$/, "")}
                        </h4>
                    );
                }

                const bullet = trimmed.match(/^[•\-*+]\s+(.*)$/);
                if (bullet) {
                    return (
                        <div key={index} className="fmt-bullet">
                            <span className="fmt-dot" aria-hidden="true" />
                            <p><Inline text={bullet[1]} /></p>
                        </div>
                    );
                }

                const numbered = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
                if (numbered) {
                    return (
                        <div key={index} className="fmt-number">
                            <span className="fmt-num">{numbered[1]}</span>
                            <p><Inline text={numbered[2]} /></p>
                        </div>
                    );
                }

                return (
                    <p key={index} className="fmt-paragraph">
                        <Inline text={trimmed} />
                    </p>
                );
            })}
        </div>
    );
}

