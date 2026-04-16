"use client";

import Image from "next/image";

export interface ClientDataGridProperties
{
    data: Record<string, any>[];
    useHeader?: boolean;
    action?: (...param: any[]) => void;
    actionParameterName?: string|string[];
    columnsToHide?: string[];
    customStyle?: { td?: string, th?: string };
    tableUnfixed?: boolean;
}

export default function ClientDataGrid(props: ClientDataGridProperties)
{
    if (!props.data.length)
        return <div><p>Nenhum dado disponível</p></div>;

    const actionParameterName = props.actionParameterName ?? 'id';
    const columnsToHide = props.columnsToHide ?? [];

    const selectIcon = <Image className="inline dark:invert" src="/icons/hand_cursor.svg" width={28} height={28} alt="Selecionar" title="Selecionar" />;
    const runAction = (e: MouseEvent, row: any) => {
        e.preventDefault();

        if (Array.isArray(actionParameterName))
            props.action?.(...actionParameterName.map(param => row[param]));
        else
            props.action?.(row[actionParameterName]);
    };

    return (
        <div>
            <table className={`responsiveTable ${props.tableUnfixed ? '' : 'table-fixed'}`}>
                {props.useHeader &&
                    <thead>
                        <tr>
                            {Object.keys(props.data[0]).map( (key, index) => columnsToHide.includes(key) ? undefined : <th className={`max-w-[100%] ${props.customStyle?.th}`} key={index}>{key}</th>)}
                            {props.action && <th className={`w-[32px] whitespace-nowrap ${props.customStyle?.th}`}></th>}
                        </tr>
                    </thead>
                }
                <tbody>
                    {props.data.map( (row, index) =>
                        <tr key={index}>
                            {Object.keys(row).map( (header, hindex) => columnsToHide.includes(header) ? undefined : (<td data-th={header} key={hindex} className={`break-words ${props.customStyle?.td}`}>{row[header]}</td>))}
                            {props.action && <td data-th="Selecionar" className={props.customStyle?.td}><a href="#" onClick={e => runAction(e as any, row)} >{selectIcon}</a></td>}
                        </tr>
                    )}
                </tbody>
            </table>
            
        </div>
    )
}