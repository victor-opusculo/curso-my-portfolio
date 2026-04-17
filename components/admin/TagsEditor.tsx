'use client';

import { KeyboardEvent, useState } from "react";

export default function TagsEditor(props: {
    value: Set<string>;
    setValue: (newVal: Set<string>) => void;
}) {
    const [ add, setAdd ] = useState('');

    const removeTag = (tag: string) => (_: any) => {
        const newSet = props.value.difference(new Set([ tag ]));
        props.setValue(newSet);
    };

    const addTag = () => {
        if (add) {
            props.setValue(new Set([ ...props.value, add ]));
            setAdd('');
        }
    };

    const addKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === ',' || e.key === '.' || e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            addTag();
        }
    };

    return (
        <div className="bg-neutral-300 dark:bg-neutral-700 my-2 p-2 rounded-xl">
            <div className="flex flex-row flex-wrap gap-2">
                {[...props.value].map(( tag, idx ) => (
                    <span key={idx} className="tagLabel">
                        {tag}{' '}
                        <button
                            type="button"
                            className="ml-4 cursor-pointer"
                            onClick={removeTag(tag)}
                        >
                            &times;
                        </button>{' '}
                    </span>
                ))}
            </div>
            <div className="mt-2">
                <input
                    type="text"
                    placeholder="Nova tag"
                    maxLength={100}
                    className="txtinput"
                    value={add}
                    onChange={e => setAdd(e.target.value)}
                    onKeyDown={addKeyDown}
                />
                <button
                    type="button"
                    className="btn font-bold ml-2"
                    onClick={addTag}
                >
                    +
                </button>
            </div>

        </div>
    );
}