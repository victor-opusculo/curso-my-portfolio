'use client';

import { AttachmentData } from "@/lib/projects/projectAttachments";
import { useState } from "react";
import AdminMediaClientSelect from "../media/ClientSelect";

export default function AttachmentsEditor(props: {
    value: AttachmentData[],
    setValue: (v: AttachmentData[]) => void;
}) {
    const [ search, setSearch ] = useState({ enabled: false, attachIndex: null as number|null });

    const setId = (id: number) => {
        setSearch({ enabled: false, attachIndex: null });
        props.setValue(
            props.value.with(search.attachIndex!, {
                ...props.value[search.attachIndex!],
                mediaId: id
            })
        );
    };

    return (
        <>
            <ol className="list-decimal ml-2 pl-4">
                {props.value.map( (attach, idx) => (
                    <li key={idx} className="mt-1">
                        <span className="flex flex-row gap-2 items-center">
                            <input
                                type="number"
                                className="txtinput"
                                required
                                min={1}
                                step={1}
                                placeholder="ID de mídia"
                                value={attach.mediaId || ''}
                                onChange={e =>
                                    props.setValue(
                                        props.value.with(idx, {
                                            ...props.value[idx],
                                            mediaId: Number.parseInt(e.target.value)
                                        })
                                    )
                                }
                            />
                            <label>
                                <input
                                    type="checkbox"
                                    className="mr-2"
                                    checked={attach.isGallery}
                                    onChange={e => props.setValue(
                                        props.value.with(idx, {
                                            ...props.value[idx],
                                            isGallery: e.target.checked
                                        })
                                    )}
                                />
                                Exibir na galeria
                            </label>

                            <button
                                type="button"
                                className="btn"
                                onClick={() =>
                                    setSearch(cs =>
                                        cs.enabled && cs.attachIndex === idx
                                            ? {
                                                enabled: false,
                                                attachIndex: null
                                            }
                                            : {
                                                enabled: true,
                                                attachIndex: idx
                                            }
                                    )
                                }
                            >
                                Procurar
                            </button>
                            <button
                                type="button"
                                className="btn"
                                onClick={()=>
                                    props.setValue(
                                        props.value.filter((_, i) => idx !== i)
                                    )
                                }
                            >
                                &times;
                            </button>
                        </span>
                    </li>
                ))}
            </ol>

            <button
                type="button"
                className="btn mt-2"
                onClick={() => 
                    props.setValue([
                        ...props.value,
                        { mediaId: 0, isGallery: false }
                    ])
                }
            >
                + Anexo
            </button>

            {search.enabled && typeof search.attachIndex === 'number' && (
                <fieldset className="fieldset">
                    <legend>Procurar anexo</legend>
                    <AdminMediaClientSelect setId={setId} />
                </fieldset>
            )}
        </>
    );
}