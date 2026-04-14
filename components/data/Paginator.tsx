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

    return (
        <ul className="pagination">
            {props.pageNumber > 1 && <li><Link href={{ pathname: props.basePath, query: pagNum(props.pageNumber - 1)}}>{leftArrow}</Link></li>}
            {props.pageNumber > 3 &&
                <>
                    <li><Link href={{pathname: props.basePath, query: pagNum(1)}}>1</Link></li>
                    <li>...</li>
                </>
            }
            {props.pageNumber - 2 > 0 && <li><Link href={{pathname: props.basePath, query: pagNum(props.pageNumber - 2)}}>{props.pageNumber - 2}</Link></li>}
            {props.pageNumber - 1 > 0 && <li><Link href={{pathname: props.basePath, query: pagNum(props.pageNumber - 1)}}>{props.pageNumber - 1}</Link></li>}

            <li className="currentPageNum"><Link href={{pathname: props.basePath, query: pagNum(props.pageNumber)}}>{props.pageNumber}</Link></li>

            {props.pageNumber + 1 < Math.ceil(props.totalItems / props.numberResultsOnPage) + 1 && <li><Link href={{pathname: props.basePath, query: pagNum(props.pageNumber + 1)}}>{props.pageNumber + 1}</Link></li>}
            {props.pageNumber + 2 < Math.ceil(props.totalItems / props.numberResultsOnPage) + 1 && <li><Link href={{pathname: props.basePath, query: pagNum(props.pageNumber + 2)}}>{props.pageNumber + 2}</Link></li>}
        
            {(props.pageNumber < Math.ceil(props.totalItems / props.numberResultsOnPage) && <>
                <li>...</li>
                <li><Link href={{pathname: props.basePath, query: pagNum(Math.ceil(props.totalItems / props.numberResultsOnPage))}}>{Math.ceil(props.totalItems / props.numberResultsOnPage)}</Link></li>
            </>)}

            {props.pageNumber < Math.ceil(props.totalItems / props.numberResultsOnPage) &&
                <li><Link href={{pathname: props.basePath, query: pagNum(props.pageNumber + 1)}}>{rightArrow}</Link></li>
            }
        </ul>
    );
}