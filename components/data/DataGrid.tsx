import Image from "next/image";
import Link from "next/link";

export interface DataGridProperties
{
    data: Record<string, any>[];
    useHeader?: boolean;
    detailsUrl?: string;
    editUrl?: string;
    deleteUrl?: string;
    rudButtonsParameterName?: string;
    columnsToHide?: string[];
    customStyle?: { td?: string, th?: string };
    tableUnfixed?: boolean;
}

function replaceParamInUrl(paramName: string, rowObject: any, urlTemplate: string) : string
{
    const value = rowObject[paramName];
    return urlTemplate.replace('{param}', value);
}

export default function DataGrid(props: DataGridProperties)
{
    if (!props.data.length)
        return <div><p>Nenhum dado disponível</p></div>;

    const rudButtonsParameterName = props.rudButtonsParameterName ?? 'id';
    const columnsToHide = props.columnsToHide ?? [];

    const detailsIcon = <Image className="inline dark:invert" src="/icons/search_icon.svg" width={28} height={28} alt="Detalhes" title="Detalhes" />;
    const editIcon = <Image className="inline dark:invert" src="/icons/edit_icon.svg" width={32} height={32} alt="Editar" title="Editar" />;
    const deleteIcon = <Image className="inline dark:invert" src="/icons/delete_icon.svg" width={24} height={24} alt="Excluir" title="Excluir" />;

    return (
        <div>
            <table className={`responsiveTable ${props.tableUnfixed ? '' : 'table-fixed'}`}>
                {props.useHeader &&
                    <thead>
                        <tr>
                            {Object.keys(props.data[0]).map( (key, index) => columnsToHide.includes(key) ? undefined : <th className={`max-w-[100%] ${props.customStyle?.th}`} key={index}>{key}</th>)}
                            {props.detailsUrl && <th className={`w-[32px] whitespace-nowrap ${props.customStyle?.th}`}></th>}
                            {props.editUrl && <th className={`w-[32px] whitespace-nowrap ${props.customStyle?.th}`}></th>}
                            {props.deleteUrl && <th className={`w-[32px] whitespace-nowrap ${props.customStyle?.th}`}></th>}
                        </tr>
                    </thead>
                }
                <tbody>
                    {props.data.map( (row, index) =>
                        <tr key={index}>
                            {Object.keys(row).map( (header, hindex) => columnsToHide.includes(header) ? undefined : (<td data-th={header} key={hindex} className={`break-words ${props.customStyle?.td}`}>{row[header]}</td>))}
                            {props.detailsUrl && <td data-th="Detalhes" className={props.customStyle?.td}><Link href={replaceParamInUrl(rudButtonsParameterName, row, props.detailsUrl)}>{detailsIcon}</Link></td>}
                            {props.editUrl && <td data-th="Editar" className={props.customStyle?.td}><Link href={replaceParamInUrl(rudButtonsParameterName, row, props.editUrl)}>{detailsIcon}</Link></td>}
                            {props.deleteUrl && <td data-th="Excluir" className={props.customStyle?.td}><Link href={replaceParamInUrl(rudButtonsParameterName, row, props.deleteUrl)}>{detailsIcon}</Link></td>}
                        </tr>
                    )}
                </tbody>
            </table>
            
        </div>
    )
}