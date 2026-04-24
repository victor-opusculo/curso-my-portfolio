# Aula 14

# Componentes de exibição de dados para o lado do cliente

1. Dentro de `components/data`, criar o diretório `client`;
1. Dentro, criar `ClientDataGrid.tsx`:

    ```tsx
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
        tableUnfixed?: boolean
    };

    export default function ClientDataGrid(props: ClientDataGridProperties)
    {
        if (!props.data.length)
            return <div><p>Nenhum dado disponível.</p></div>;

        const actionParameterName = props.actionParameterName ?? 'id';
        const columnsToHide = props.columnsToHide ?? [];

        const selectIcon = <Image className="inline dark:invert" src="/icons/hand_cursor.svg" width={28} height={28} alt="Selecionar" title="Selecionar"/>;
        const runAction = (e: MouseEvent, row: any) =>
        {
            e.preventDefault();

            if (Array.isArray(actionParameterName))
                props.action?.(...actionParameterName.map(param => row[param]));
            else
                props.action?.(row[actionParameterName]);
        };

        return <div>
            <table className={`responsiveTable ${props.tableUnfixed ? '' : 'table-fixed'}`}>
            {props.useHeader && 
                <thead>
                    <tr>
                        {Object.keys(props.data[0]).map( (key, index) => columnsToHide.includes(key) ? undefined : <th className={`max-w-[100%] ${props.customStyle?.th}`} key={index}>{key}</th> )}
                        {props.action && <th className={`w-[32px] whitespace-nowrap ${props.customStyle?.th}`}></th>}
                    </tr>
                </thead>
            }
            <tbody>
                {props.data.map( (row, index) => 
                    <tr key={index}>
                        {Object.keys(row).map( (header, hindex) => columnsToHide.includes(header) ? undefined : (<td data-th={header} key={hindex} className={`break-words ${props.customStyle?.td}`}>{row[header]}</td>))}
                        {props.action && <td data-th="Selecionar" className={props.customStyle?.td}><a href="#" onClick={e => runAction(e as any, row)}>{selectIcon}</a></td>}
                    </tr>)
                }
            </tbody>  
        </table>
        </div>;
    }

    ```

1. Também o arquivo `ClientPaginator.tsx`:

    ```tsx
    "use client";

    export interface ClientPaginator
    {
        pageNumber: number;
        totalItems: number;
        numberResultsOnPage: number;
        setPage: (pageNum: number) => void;
    }

    export default function ClientPaginator(props: ClientPaginator)
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

        const setPageLinkClick = (pageNum: number) =>
        {
            return (e: any) =>
            {
                e.preventDefault();
                props.setPage(pageNum);
            }
        };

        return <ul className="pagination">
            {props.pageNumber > 1 && <li><a onClick={setPageLinkClick(props.pageNumber - 1)}>{leftArrow}</a></li>}
            {props.pageNumber > 3 && 
                <><li><a onClick={setPageLinkClick(1)}>1</a></li>
                <li>...</li></>
            }
            {props.pageNumber - 2 > 0 && <li><a onClick={setPageLinkClick(props.pageNumber - 2)}>{props.pageNumber - 2}</a></li>}
            {props.pageNumber - 1 > 0 && <li><a onClick={setPageLinkClick(props.pageNumber - 1)}>{props.pageNumber - 1}</a></li>}

            <li className="currentPageNum"><a onClick={setPageLinkClick(props.pageNumber)}>{props.pageNumber}</a></li>

            {props.pageNumber + 1 < Math.ceil(props.totalItems / props.numberResultsOnPage) + 1 && <li><a onClick={setPageLinkClick(props.pageNumber + 1)}>{props.pageNumber + 1}</a></li>}
            {props.pageNumber + 2 < Math.ceil(props.totalItems / props.numberResultsOnPage) + 1 && <li><a onClick={setPageLinkClick(props.pageNumber + 2)}>{props.pageNumber + 2}</a></li>}

            {(props.pageNumber < Math.ceil(props.totalItems / props.numberResultsOnPage) - 2) && <><li>...</li>
                <li><a onClick={setPageLinkClick(Math.ceil(props.totalItems / props.numberResultsOnPage)) }>{Math.ceil(props.totalItems / props.numberResultsOnPage)}</a></li></>
            }
            {props.pageNumber < Math.ceil(props.totalItems / props.numberResultsOnPage) &&
                <li><a onClick={setPageLinkClick(props.pageNumber + 1)}>{rightArrow}</a></li>
            }
        </ul>;
    }
    ```

1. E então, o `ClientSearchField.tsx`:

    ```tsx
    "use client";

    import { KeyboardEvent, useState } from 'react';

    export interface ClientSearchFieldProperties
    {
        action: (query: string) => void;
    }

    export const icon = <svg className="inline-block fill-(--background) w-[1.6rem] h-[1.6rem]" id="Layer_1" viewBox="0 0 46.553307 46.200966" version="1.1">
            <g transform="translate(-29.461,-26.738)" >
                <path
                    d="m69.902 72.704-10.935-10.935c-2.997 1.961-6.579 3.111-10.444 3.111-10.539 0-19.062-8.542-19.062-19.081 0-10.519 8.522-19.061 19.062-19.061 10.521 0 19.06 8.542 19.06 19.061 0 3.679-1.036 7.107-2.828 10.011l11.013 11.011c0.583 0.567 0.094 1.981-1.076 3.148l-1.64 1.644c-1.17 1.167-2.584 1.656-3.15 1.091zm-8.653-26.905c0-7.033-5.695-12.727-12.727-12.727-7.033 0-12.745 5.694-12.745 12.727s5.712 12.745 12.745 12.745c7.032 0 12.727-5.711 12.727-12.745z"
                />
            </g>
        </svg>;

    export default function ClientSearchField(props: ClientSearchFieldProperties)
    {
        const [ query, setQuery ] = useState("");

        const submit = () => props.action(query);

        const txtOnKeyDown = (e: KeyboardEvent<HTMLInputElement>) =>
        {
            if (e.key === 'Enter')
            {
                e.preventDefault();
                e.stopPropagation();
                submit();
            }
        }

        return <div>
            <label className="flex flex-row items-center w-full lg:w-1/2">
                <span className="shrink mr-2">Pesquisar: </span>
                <input className="grow txtinput" size={6} type="search" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={txtOnKeyDown} />
                <button type="button" className="shrink btn ml-2 py-1" onClick={submit}>
                    {icon}
                </button>
            </label>
        </div>;
    }
    ```