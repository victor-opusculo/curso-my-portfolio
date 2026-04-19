'use client';

import { useState } from "react";
import AdminToolsClientSelect from "../tools/ClientSelect";

type ToolInfo = { title: string; id: number|null };

export default function ToolsEditor(props: {
    value: ToolInfo[];
    setValue: (v: ToolInfo[]) => void;
}) {
    const [  search, setSearch ] = useState({ enabled: false, toolIndex: null as null|number});

    const setIdAndTitle = (id: number, title: string) => {
        setSearch({ enabled: false, toolIndex: null });
        props.setValue(
            props.value.with(search.toolIndex!, { id: Number(id), title })
        );
    };

    return (
        <div className="mt-4">
            <ol className="list-decimal pl-4">
                {props.value.map( (tool, idx) => (
                    <li key={idx} className="my-1">
                        <span className="flex flex-row gap-1">
                            <button
                                className="btn"
                                type="button"
                                onClick={() => 
                                    setSearch(cs =>
                                        cs.enabled && cs.toolIndex === idx
                                            ? {
                                                enabled: false,
                                                toolIndex: null,
                                            }
                                            : { enabled: true, toolIndex: idx }
                                    )
                                }
                            >
                                {tool.title}
                            </button>
                            <button className="btn"
                                type="button"
                                onClick={() =>
                                    props.setValue(
                                        props.value.filter(
                                            (_, vidx) => idx !== vidx
                                        )
                                    )
                                }
                            >
                                &times;
                            </button>
                        </span>
                    </li>
                ))}
            </ol>

            {search.enabled && typeof search.toolIndex === 'number' && (
                <fieldset className="fieldset">
                    <legend>Procurar ferramenta</legend>
                    <AdminToolsClientSelect setIdAndTitle={setIdAndTitle} />
                </fieldset>
            )}

            <button
                type="button"
                className="btn"
                onClick={() => 
                    props.setValue([
                        ...props.value,
                        { id: null, title: ' -- Selecione -- '}
                    ])
                }
            >
                + Ferramenta
            </button>
        </div>
    );
}