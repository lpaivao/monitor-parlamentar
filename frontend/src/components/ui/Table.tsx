/* eslint-disable react-refresh/only-export-components */
import MuiTable, { type TableProps as MuiTableProps } from "@mui/material/Table";
import MuiTableBody, { type TableBodyProps as MuiTableBodyProps } from "@mui/material/TableBody";
import MuiTableCell, { type TableCellProps as MuiTableCellProps } from "@mui/material/TableCell";
import MuiTableContainer, { type TableContainerProps as MuiTableContainerProps } from "@mui/material/TableContainer";
import MuiTableHead, { type TableHeadProps as MuiTableHeadProps } from "@mui/material/TableHead";
import MuiTableRow, { type TableRowProps as MuiTableRowProps } from "@mui/material/TableRow";

type TableRootProps = MuiTableProps & {
    containerClassName?: string;
    containerProps?: MuiTableContainerProps;
};

function Root({ children, className, containerClassName, containerProps, ...props }: TableRootProps) {
    return (
        <MuiTableContainer className={containerClassName} {...containerProps}>
            <MuiTable className={className} {...props}>
                {children}
            </MuiTable>
        </MuiTableContainer>
    );
}

function Header(props: MuiTableHeadProps) {
    return <MuiTableHead {...props} />;
}

function Body(props: MuiTableBodyProps) {
    return <MuiTableBody {...props} />;
}

function Row(props: MuiTableRowProps) {
    return <MuiTableRow {...props} />;
}

function ColumnHeaderCell(props: MuiTableCellProps) {
    return <MuiTableCell {...props} />;
}

function Cell(props: MuiTableCellProps) {
    return <MuiTableCell {...props} />;
}

function RowHeaderCell({ scope = "row", ...props }: MuiTableCellProps) {
    return <MuiTableCell component="th" scope={scope} {...props} />;
}

export const Table = {
    Root,
    Header,
    Body,
    Row,
    ColumnHeaderCell,
    Cell,
    RowHeaderCell,
};
