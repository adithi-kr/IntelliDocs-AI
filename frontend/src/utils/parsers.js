/*
 * Parse the AI's loosely formatted MCQ / viva text into structured data.
 */

export const stripMd = (line) =>
    line
        .replace(/\*\*/g, "")
        .replace(/__/g, "")
        .replace(/^#+\s*/, "")
        .trim();

const QUESTION_START = /^(?:Q(?:uestion)?\s*)?(\d+)\s*[.):-]\s*(.*)$/i;
const Q_PREFIX = /^Q(?:uestion)?\s*\d*\s*[:.)-]\s*(.*)$/i;
const ANSWER_LINE = /^(?:correct\s+)?(?:ans(?:wer)?|a)\s*\d*\s*[:.)-]\s*(.*)$/i;
const OPTION_LINE = /^\(?([A-D])[).:]\s*(.*)$/i;

/**
 * Parse MCQs like:
 *   1. What is X?
 *   A) foo   B) bar ...
 *   Correct Answer: B
 */
export function parseMCQs(text) {
    if (!text) return [];

    const lines = text.split("\n").map(stripMd).filter(Boolean);
    const blocks = [];

    for (const line of lines) {
        if (QUESTION_START.test(line) || /^Question\s*\d*\s*:/i.test(line)) {
            blocks.push([line]);
        } else if (blocks.length) {
            blocks[blocks.length - 1].push(line);
        }
    }

    return blocks
        .map((block) => {
            let question = "";
            let answer = "";
            let explanation = "";
            const options = [];

            // Split a trailing "... Answer: B" off any line into its own line
            const expanded = block.flatMap((line) => {
                const m = line.match(/^(.*\S)\s+((?:correct\s+)?answer\s*[:\-–].*)$/i);
                return m ? [m[1], m[2]] : [line];
            });

            expanded.forEach((line, i) => {
                if (i === 0) {
                    const m = line.match(QUESTION_START) || line.match(Q_PREFIX);
                    question = (m ? m[m.length - 1] : line).trim();
                    return;
                }

                const correct = line.match(/^(?:correct\s+)?answer\s*[:\-–]\s*(.*)$/i);
                if (correct) {
                    answer = correct[1].trim();
                    return;
                }

                const expl = line.match(/^explanation\s*[:\-–]\s*(.*)$/i);
                if (expl) {
                    explanation = expl[1].trim();
                    return;
                }

                const opt = line.match(OPTION_LINE);
                if (opt) {
                    options.push({ letter: opt[1].toUpperCase(), text: opt[2].trim() });
                    return;
                }

                if (explanation) explanation += " " + line;
                else if (!options.length) question += " " + line;
            });

            // Options written inline: "What is X? A) foo B) bar C) baz D) qux"
            if (!options.length) {
                const inline = question.split(/\s+(?=\(?[A-D][).]\s)/);
                if (inline.length >= 3) {
                    question = inline.shift().trim();
                    inline.forEach((chunk) => {
                        const m = chunk.match(OPTION_LINE);
                        if (m) options.push({ letter: m[1].toUpperCase(), text: m[2].trim() });
                    });
                }
            }

            const letter = answer.match(/^\(?([A-D])\b/i)?.[1]?.toUpperCase()
                || options.find((o) => answer && o.text.toLowerCase() === answer.toLowerCase())?.letter
                || "";

            return { question, options, answer, letter, explanation };
        })
        .filter((q) => q.question && q.question.toLowerCase() !== "question");
}

/** Parse viva Q&A pairs in all the shapes the AI tends to produce. */
export function parseViva(text) {
    if (!text) return [];

    const lines = text.split("\n").map(stripMd).filter(Boolean);
    const pairs = [];
    let current = null;
    let mode = null;

    for (const line of lines) {
        const sameLine = line.match(/^(.*?\?)\s*(?:ans(?:wer)?|a)\s*[:.-]\s*(.+)$/i);
        const q = line.match(QUESTION_START) || line.match(Q_PREFIX);
        const a = line.match(ANSWER_LINE);

        if (sameLine) {
            const question = (sameLine[1].match(QUESTION_START) || sameLine[1].match(Q_PREFIX));
            current = {
                q: (question ? question[question.length - 1] : sameLine[1]).trim(),
                a: sameLine[2].trim(),
            };
            pairs.push(current);
            mode = "a";
        } else if (a && current) {
            current.a = (current.a ? current.a + " " : "") + a[1].trim();
            mode = "a";
        } else if (q) {
            current = { q: q[q.length - 1].trim(), a: "" };
            pairs.push(current);
            mode = "q";
        } else if (current) {
            if (mode === "q" && !/[?.:]$/.test(current.q)) {
                current.q += " " + line;
            } else if (mode === "q") {
                current.a = line;
                mode = "a";
            } else {
                current.a = (current.a ? current.a + " " : "") + line;
            }
        }
    }

    return pairs.filter((p) => p.q);
}
