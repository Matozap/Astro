import {
  Component,
  Input,
  Output,
  EventEmitter,
  ContentChildren,
  QueryList,
  TemplateRef,
  AfterContentInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PAGE_SIZE_OPTIONS } from '../../models/table.model';

export interface ColumnDef {
  field: string;
  header: string;
  sortable?: boolean;
  template?: TemplateRef<unknown>;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatProgressBarModule,
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent<T> implements AfterContentInit, OnChanges {
  @Input() data: T[] = [];
  @Input() columns: ColumnDef[] = [];
  @Input() totalCount = 0;
  @Input() pageSize = 10;
  @Input() pageIndex = 0;
  @Input() loading = false;
  @Input() pageSizeOptions = PAGE_SIZE_OPTIONS;

  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() sortChange = new EventEmitter<Sort>();
  @Output() rowClick = new EventEmitter<T>();

  @ContentChildren('columnTemplate') columnTemplates!: QueryList<TemplateRef<unknown>>;

  displayedColumns: string[] = [];

  ngAfterContentInit(): void {
    this.updateDisplayedColumns();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns']) {
      this.updateDisplayedColumns();
    }
  }

  private updateDisplayedColumns(): void {
    this.displayedColumns = this.columns.map((col) => col.field);
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  onSortChange(sort: Sort): void {
    this.sortChange.emit(sort);
  }

  onRowClick(row: T): void {
    this.rowClick.emit(row);
  }

  getColumnTemplate(field: string): TemplateRef<unknown> | undefined {
    const col = this.columns.find((c) => c.field === field);
    return col?.template;
  }

  getCellValue(row: T, field: string): unknown {
    const keys = field.split('.');
    let value: unknown = row;
    for (const key of keys) {
      if (value && typeof value === 'object') {
        value = (value as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }
    return value;
  }
}
