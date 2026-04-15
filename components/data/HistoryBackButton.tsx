"use client";

export default function HistoryBackButton()
{
    return <button type="button" className="btn" onClick={() => history.back()}>
        {" << Voltar "}
    </button>;
}