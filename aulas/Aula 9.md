# Aula 9

## Componentes para exibição de dados

1. Dentro de `components`, criar o diretório `data`;
1. Dentro, criar `DataGrid.tsx` com:

    ```tsx
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
        tableUnfixed?: boolean
    };

    function replaceParamInUrl(paramName: string, rowObject: any, urlTemplate: string) : string
    {
        const value = rowObject[paramName];
        return urlTemplate.replace('{param}', value);
    }

    export default function DataGrid(props: DataGridProperties)
    {
        if (!props.data.length)
            return <div><p>Nenhum dado disponível.</p></div>;

        const rudButtonsParameterName = props.rudButtonsParameterName ?? 'id';
        const columnsToHide = props.columnsToHide ?? [];

        const detailsIcon = <Image className="inline dark:invert" src="/icons/search_icon.svg" width={28} height={28} alt="Detalhes" title="Detalhes"/>;
        const editIcon = <Image className="inline dark:invert" src="/icons/edit_icon.svg" width={32} height={32} alt="Editar" title="Editar"/>;
        const deleteIcon = <Image className="inline dark:invert" src="/icons/delete_icon.svg" width={24} height={24} alt="Excluir" title="Excluir"/>;

        return <div>
            <table className={`responsiveTable ${props.tableUnfixed ? '' : 'table-fixed'}`}>
            {props.useHeader && 
                <thead>
                    <tr>
                        {Object.keys(props.data[0]).map( (key, index) => columnsToHide.includes(key) ? undefined : <th className={`max-w-[100%] ${props.customStyle?.th}`} key={index}>{key}</th> )}
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
                        {props.editUrl && <td data-th="Editar" className={props.customStyle?.td}><Link href={replaceParamInUrl(rudButtonsParameterName, row, props.editUrl)}>{editIcon}</Link></td>}
                        {props.deleteUrl && <td data-th="Excluir" className={props.customStyle?.td}><Link href={replaceParamInUrl(rudButtonsParameterName, row, props.deleteUrl)}>{deleteIcon}</Link></td>}
                    </tr>)
                }
            </tbody>  
        </table>
        </div>;
    }
    ```

1. Criar também `Paginator.tsx` com:

    ```tsx
    import Link from "next/link";

    export interface PaginatorProperties
    {
        pageNumber: number;
        totalItems: number;
        numberResultsOnPage: number;
        basePath: string;
        baseQueryString: { [key: string]: string | string[] | undefined };
    }

    export default function Paginator(props: PaginatorProperties)
    {

        if (Math.ceil(props.totalItems / props.numberResultsOnPage) === 0)
            return undefined;

        const leftArrow = <svg className="w-[1.3rem] h-[1.3rem] inline-block fill-(--foreground)" id="svg3578" viewBox="0 0 431.32 360.61">
            <g id="g3588" >
                <path
                    id="path3590"
                    d="m180.2 360.4l-180.2-180.2 180.2-180.2h118.85l-137.06 137.07h269.33v87.22h-268.37l136.31 136.32-119.06-0.21z"
                />
            </g>
        </svg>;

        const rightArrow = <svg className="w-[1.3rem] h-[1.3rem] inline-block fill-(--foreground)" id="svg3370" viewBox="0 0 431.32 360.61">
            <g id="g3380">
            <path
                id="path3382"
                d="m251.12 0.21301l180.2 180.2-180.2 180.2h-118.85l137.06-137.07h-269.33v-87.22h268.38l-136.32-136.32 119.06 0.21301z"
            />
            </g>
        </svg>;

        const pagNum = (num: number) => ({ ...props.baseQueryString, "page": num });

        return <ul className="pagination">
            {props.pageNumber > 1 && <li><Link href={{pathname: props.basePath, query: pagNum(props.pageNumber - 1)}}>{leftArrow}</Link></li>}
            {props.pageNumber > 3 && 
                <><li><Link href={{pathname: props.basePath, query: pagNum(1)}}>1</Link></li>
                <li>...</li></>
            }
            {props.pageNumber - 2 > 0 && <li><Link href={{pathname: props.basePath, query: pagNum(props.pageNumber - 2)}}>{props.pageNumber - 2}</Link></li>}
            {props.pageNumber - 1 > 0 && <li><Link href={{pathname: props.basePath, query: pagNum(props.pageNumber - 1)}}>{props.pageNumber - 1}</Link></li>}

            <li className="currentPageNum"><Link href={{pathname: props.basePath, query: pagNum(props.pageNumber)}}>{props.pageNumber}</Link></li>

            {props.pageNumber + 1 < Math.ceil(props.totalItems / props.numberResultsOnPage) + 1 && <li><Link href={{pathname: props.basePath, query: pagNum(props.pageNumber + 1)}}>{props.pageNumber + 1}</Link></li>}
            {props.pageNumber + 2 < Math.ceil(props.totalItems / props.numberResultsOnPage) + 1 && <li><Link href={{pathname: props.basePath, query: pagNum(props.pageNumber + 2)}}>{props.pageNumber + 2}</Link></li>}

            {(props.pageNumber < Math.ceil(props.totalItems / props.numberResultsOnPage) - 2) && <><li>...</li>
                <li><Link href={{pathname: props.basePath, query: pagNum(Math.ceil(props.totalItems / props.numberResultsOnPage)) }}>{Math.ceil(props.totalItems / props.numberResultsOnPage)}</Link></li></>
            }
            {props.pageNumber < Math.ceil(props.totalItems / props.numberResultsOnPage) &&
                <li><Link href={{pathname: props.basePath, query: pagNum(props.pageNumber + 1)}}>{rightArrow}</Link></li>
            }
        </ul>;
    }
    ```

1. Criar `BasicSearchField.tsx` com:

    ```tsx
    "use client";

    import { useRouter } from 'next/navigation';
    import { useState } from 'react';

    export interface BasicSearchFieldProperties
    {
        basePath: string;
        currentValue: string|undefined;
    }

    export const icon = <svg className="inline-block fill-(--background) w-[1.6rem] h-[1.6rem]" id="Layer_1" viewBox="0 0 46.553307 46.200966" version="1.1">
            <g transform="translate(-29.461,-26.738)" >
                <path
                    d="m69.902 72.704-10.935-10.935c-2.997 1.961-6.579 3.111-10.444 3.111-10.539 0-19.062-8.542-19.062-19.081 0-10.519 8.522-19.061 19.062-19.061 10.521 0 19.06 8.542 19.06 19.061 0 3.679-1.036 7.107-2.828 10.011l11.013 11.011c0.583 0.567 0.094 1.981-1.076 3.148l-1.64 1.644c-1.17 1.167-2.584 1.656-3.15 1.091zm-8.653-26.905c0-7.033-5.695-12.727-12.727-12.727-7.033 0-12.745 5.694-12.745 12.727s5.712 12.745 12.745 12.745c7.032 0 12.727-5.711 12.727-12.745z"
                />
            </g>
        </svg>;

    export default function BasicSearchField(props: BasicSearchFieldProperties)
    {
        const [ query, setQuery ] = useState(props.currentValue);
        const router = useRouter();

        const onSubmit = (e: any) => 
        {
            e.preventDefault();
            router.push(`${props.basePath}?q=${query}`);
        };

        return <form className="my-4" onSubmit={onSubmit}>
            <label className="flex flex-row items-center w-full lg:w-1/2">
                <span className="shrink mr-2">Pesquisar: </span>
                <input className="grow txtinput" size={6} type="search" value={query} onChange={e => setQuery(e.target.value)} />
                <button type="submit" className="shrink btn ml-2 py-1">
                    {icon}
                </button>
            </label>
        </form>;
    }
    ```

1. Criar `OrderByLinks.tsx` com:

    ```tsx
    import Link from "next/link";

    export default function OrderByLinks(props: { orderByMap: Map<string, string>, fieldsUiMap: Map<string, string>, route: string, queryParams: Record<string, string|string[]|undefined>})
    {
        const ascMode = Boolean(Number.parseInt(props.queryParams.asc?.toString() ?? "0"));

        return (
            <div className="text-right">
                Ordem de exibição: 
                {props.orderByMap.entries().toArray().map(([ identifier, schemaKeyName], index) => <Link prefetch={false} key={index} className="link" href={{ pathname: props.route, query: { ...props.queryParams, order_by: identifier, asc: props.queryParams.order_by?.toString() === identifier ? Number(!ascMode) : 0 } }}>{props.fieldsUiMap.get(schemaKeyName)}</Link>)}
            </div>
        )
    }
    ```

