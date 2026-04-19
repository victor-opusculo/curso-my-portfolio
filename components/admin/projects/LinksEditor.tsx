'use client';

interface Link {
    label: string;
    url: string;
}

export default function LinksEditor(props: {
    value: Link[];
    setValue: (v: Link[]) => void;
}) {
    return (
        <>
            <ol className="list-decimal ml-2 pl-4">
                {props.value.map( (link, idx) => (
                    <li key={idx} className="mt-1">
                        <span className="flex flex-row gap-2">
                            <input
                                type="text"
                                required
                                className="txtinput shrink"
                                placeholder="Nome do link"
                                value={link.label}
                                onChange={e => 
                                    props.setValue(
                                        props.value.with(idx, {
                                            ...props.value[idx],
                                            label: e.target.value
                                        })
                                    )
                                }
                            />
                            <input
                                type="url"
                                required
                                className="txtinput grow"
                                placeholder="URL"
                                value={link.url}
                                onChange={e => 
                                    props.setValue(
                                        props.value.with(idx, {
                                            ...props.value[idx],
                                            url: e.target.value
                                        })
                                    )
                                }
                            />
                            <button
                                type="button"
                                className="btn"
                                onClick={() =>
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
                    props.setValue([...props.value, { label: '', url: '' }])
                }
            >
                + Link
            </button>
        </>
    );
}