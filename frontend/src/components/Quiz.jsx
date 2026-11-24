import { useState } from "react";

function Quiz({ mcqs }) {

    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState("");
    const [score, setScore] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    if (!mcqs || mcqs.length === 0) {
        return <p>No quiz available.</p>;
    }

    const question = mcqs[current];

    const submitAnswer = () => {

        if (!selected) return;

        if (selected === question.answer) {
            setScore(score + 1);
        }

        setShowAnswer(true);
    };

    const nextQuestion = () => {

        setSelected("");
        setShowAnswer(false);

        if (current < mcqs.length - 1) {
            setCurrent(current + 1);
        }
        else {
            setCurrent(mcqs.length);
        }
    };

    if (current >= mcqs.length) {

        return (

            <div className="text-center">

                <h2>🎉 Quiz Finished</h2>

                <h3>

                    Score

                    <br />

                    {score} / {mcqs.length}

                </h3>

            </div>

        );

    }

    return (

        <div>

            <h4>

                Question {current + 1}

            </h4>

            <p>{question.question}</p>

            {question.options.map((option) => (

                <div key={option}>

                    <label>

                        <input

                            type="radio"

                            checked={selected === option}

                            onChange={() => setSelected(option)}

                        />

                        {" "}

                        {option}

                    </label>

                </div>

            ))}

            {!showAnswer ? (

                <button
                    className="btn btn-primary mt-3"
                    onClick={submitAnswer}
                >
                    Submit
                </button>

            ) : (

                <>

                    <div className="alert alert-info mt-3">

                        Correct Answer:

                        <strong>

                            {" "}

                            {question.answer}

                        </strong>

                    </div>

                    <button
                        className="btn btn-success"
                        onClick={nextQuestion}
                    >
                        Next
                    </button>

                </>

            )}

        </div>

    );

}

export default Quiz;