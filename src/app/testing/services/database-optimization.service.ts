import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';

export interface DatabaseIndex {
  id: string;
  name: string;
  table: string;
  columns: string[];
  type: 'primary' | 'unique' | 'index' | 'fulltext' | 'spatial';
  isUnique: boolean;
  isActive: boolean;
  size: number; // in MB
  usage: {
    reads: number;
    writes: number;
    lastUsed: Date;
    efficiency: number; // percentage
  };
  performance: {
    queryTime: number; // in ms
    scanCount: number;
    logicalReads: number;
    physicalReads: number;
  };
  createdAt: Date;
  lastAnalyzed: Date;
  recommendations: string[];
}

export interface QueryPerformance {
  id: string;
  query: string;
  table: string;
  executionTime: number; // in ms
  rowsExamined: number;
  rowsReturned: number;
  indexUsed?: string;
  isOptimized: boolean;
  frequency: number; // executions per hour
  lastExecuted: Date;
  recommendations: string[];
  cost: number; // relative cost
}

export interface TableStatistics {
  id: string;
  name: string;
  rows: number;
  size: number; // in MB
  indexSize: number; // in MB
  dataSize: number; // in MB
  fragmentation: number; // percentage
  lastAnalyzed: Date;
  growthRate: number; // rows per day
  accessPattern: {
    reads: number;
    writes: number;
    updates: number;
    deletes: number;
  };
  indexes: DatabaseIndex[];
  performance: {
    averageQueryTime: number;
    slowQueries: number;
    missingIndexes: number;
  };
}

export interface OptimizationTask {
  id: string;
  name: string;
  type: 'index_creation' | 'index_dropping' | 'table_optimization' | 'query_optimization' | 'maintenance';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedTables: string[];
  estimatedDuration: number; // in minutes
  actualDuration?: number; // in minutes
  startTime?: Date;
  endTime?: Date;
  progress: number; // 0-100
  results?: {
    performanceGain: number; // percentage
    spaceSaved: number; // in MB
    queriesImproved: number;
    errors?: string[];
  };
  createdBy: string;
  createdAt: Date;
}

export interface DatabaseMetrics {
  totalTables: number;
  totalIndexes: number;
  totalSize: number; // in MB
  averageFragmentation: number;
  slowQueries: number;
  missingIndexes: number;
  optimizationTasks: number;
  completedTasks: number;
  performanceScore: number; // 0-100
  spaceUtilization: number; // percentage
  queryEfficiency: number; // percentage
  indexEfficiency: number; // percentage
  lastOptimization: Date;
  nextScheduledOptimization: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseOptimizationService {
  // ✅ Private writable signals
  private _indexes = signal<DatabaseIndex[]>([]);
  private _queries = signal<QueryPerformance[]>([]);
  private _tables = signal<TableStatistics[]>([]);
  private _tasks = signal<OptimizationTask[]>([]);
  private _metrics = signal<DatabaseMetrics>(this.getDefaultMetrics());

  // ✅ Public readonly signals
  public readonly indexes = this._indexes.asReadonly();
  public readonly queries = this._queries.asReadonly();
  public readonly tables = this._tables.asReadonly();
  public readonly tasks = this._tasks.asReadonly();
  public readonly metrics = this._metrics.asReadonly();

  // ✅ Computed signals for derived state
  public readonly indexesCount = computed(() => this._indexes().length);
  public readonly activeIndexesCount = computed(() =>
    this._indexes().filter((i: DatabaseIndex) => i.isActive).length
  );
  public readonly queriesCount = computed(() => this._queries().length);
  public readonly slowQueriesCount = computed(() =>
    this._queries().filter((q: QueryPerformance) => !q.isOptimized).length
  );
  public readonly tablesCount = computed(() => this._tables().length);
  public readonly tasksCount = computed(() => this._tasks().length);
  public readonly runningTasksCount = computed(() =>
    this._tasks().filter((t: OptimizationTask) => t.status === 'running').length
  );
  public readonly completedTasksCount = computed(() =>
    this._tasks().filter((t: OptimizationTask) => t.status === 'completed').length
  );

  // ✅ Observable compatibility layer (for backward compatibility)
  public indexes$ = new Observable<DatabaseIndex[]>(observer => {
    observer.next(this._indexes());
  });
  public queries$ = new Observable<QueryPerformance[]>(observer => {
    observer.next(this._queries());
  });
  public tables$ = new Observable<TableStatistics[]>(observer => {
    observer.next(this._tables());
  });
  public tasks$ = new Observable<OptimizationTask[]>(observer => {
    observer.next(this._tasks());
  });
  public metrics$ = new Observable<DatabaseMetrics>(observer => {
    observer.next(this._metrics());
  });

  constructor() {
    this.initializeDemoData();
  }

  /**
   * Get all indexes
   */
  getIndexes(): DatabaseIndex[] {
    return this._indexes();
  }

  /**
   * Get indexes by table
   */
  getIndexesByTable(tableName: string): DatabaseIndex[] {
    return this._indexes().filter((i: DatabaseIndex) => i.table === tableName);
  }

  /**
   * Create index
   */
  createIndex(index: Omit<DatabaseIndex, 'id' | 'createdAt' | 'lastAnalyzed' | 'usage' | 'performance' | 'recommendations'>): DatabaseIndex {
    const newIndex: DatabaseIndex = {
      ...index,
      id: this.generateId(),
      createdAt: new Date(),
      lastAnalyzed: new Date(),
      usage: {
        reads: 0,
        writes: 0,
        lastUsed: new Date(),
        efficiency: 0
      },
      performance: {
        queryTime: 0,
        scanCount: 0,
        logicalReads: 0,
        physicalReads: 0
      },
      recommendations: []
    };

    const indexes = this._indexes();
    this._indexes.set([...indexes, newIndex]);

    // Create optimization task
    this.createOptimizationTask({
      name: `Create index ${newIndex.name}`,
      type: 'index_creation',
      priority: 'medium',
      description: `Creating index ${newIndex.name} on table ${newIndex.table}`,
      affectedTables: [newIndex.table],
      estimatedDuration: 5,
      createdBy: 'system'
    });

    this.updateMetrics();
    return newIndex;
  }

  /**
   * Drop index
   */
  dropIndex(indexId: string): boolean {
    const indexes = this._indexes();
    const index = indexes.find(i => i.id === indexId);

    if (!index) return false;

    // Create optimization task
    this.createOptimizationTask({
      name: `Drop index ${index.name}`,
      type: 'index_dropping',
      priority: 'low',
      description: `Dropping index ${index.name} from table ${index.table}`,
      affectedTables: [index.table],
      estimatedDuration: 2,
      createdBy: 'system'
    });

    this._indexes.set(indexes.filter((i: DatabaseIndex) => i.id !== indexId));
    this.updateMetrics();
    return true;
  }

  /**
   * Analyze index performance
   */
  analyzeIndex(indexId: string): DatabaseIndex | null {
    const indexes = this._indexes();
    const index = indexes.find(i => i.id === indexId);

    if (!index) return null;

    // Simulate analysis
    index.usage.efficiency = Math.random() * 100;
    index.usage.reads = Math.floor(Math.random() * 1000);
    index.usage.writes = Math.floor(Math.random() * 100);
    index.usage.lastUsed = new Date();

    index.performance.queryTime = Math.random() * 100;
    index.performance.scanCount = Math.floor(Math.random() * 100);
    index.performance.logicalReads = Math.floor(Math.random() * 1000);
    index.performance.physicalReads = Math.floor(Math.random() * 100);

    index.lastAnalyzed = new Date();

    // Generate recommendations
    index.recommendations = this.generateIndexRecommendations(index);

    this._indexes.set([...indexes]);
    this.updateMetrics();
    return index;
  }

  /**
   * Get query performance data
   */
  getQueryPerformance(): QueryPerformance[] {
    return this._queries();
  }

  /**
   * Get slow queries
   */
  getSlowQueries(threshold: number = 1000): QueryPerformance[] {
    return this._queries().filter((q: QueryPerformance) => q.executionTime > threshold);
  }

  /**
   * Optimize query
   */
  optimizeQuery(queryId: string): QueryPerformance | null {
    const queries = this._queries();
    const query = queries.find(q => q.id === queryId);

    if (!query) return null;

    // Simulate optimization
    query.executionTime *= 0.5; // 50% improvement
    query.isOptimized = true;
    query.recommendations = this.generateQueryRecommendations(query);

    this._queries.set([...queries]);
    this.updateMetrics();
    return query;
  }

  /**
   * Get table statistics
   */
  getTableStatistics(): TableStatistics[] {
    return this._tables();
  }

  /**
   * Get table by name
   */
  getTable(tableName: string): TableStatistics | undefined {
    return this._tables().find((t: TableStatistics) => t.name === tableName);
  }

  /**
   * Optimize table
   */
  optimizeTable(tableName: string): boolean {
    const tables = this._tables();
    const table = tables.find(t => t.name === tableName);

    if (!table) return false;

    // Create optimization task
    this.createOptimizationTask({
      name: `Optimize table ${tableName}`,
      type: 'table_optimization',
      priority: 'high',
      description: `Optimizing table ${tableName}`,
      affectedTables: [tableName],
      estimatedDuration: 10,
      createdBy: 'system'
    });

    // Simulate optimization
    table.fragmentation *= 0.3; // Reduce fragmentation by 70%
    table.lastAnalyzed = new Date();

    this._tables.set([...tables]);
    this.updateMetrics();
    return true;
  }

  /**
   * Get optimization tasks
   */
  getOptimizationTasks(): OptimizationTask[] {
    return this._tasks();
  }

  /**
   * Create optimization task
   */
  createOptimizationTask(task: Omit<OptimizationTask, 'id' | 'createdAt' | 'status' | 'progress'>): OptimizationTask {
    const newTask: OptimizationTask = {
      ...task,
      id: this.generateId(),
      createdAt: new Date(),
      status: 'pending',
      progress: 0
    };

    const tasks = this._tasks();
    this._tasks.set([...tasks, newTask]);

    // Simulate task execution
    this.executeTask(newTask.id);

    return newTask;
  }

  /**
   * Execute optimization task
   */
  private executeTask(taskId: string): void {
    const tasks = this._tasks();
    const task = tasks.find(t => t.id === taskId);

    if (!task) return;

    task.status = 'running';
    task.startTime = new Date();
    this._tasks.set([...tasks]);

    // Simulate task execution
    const interval = setInterval(() => {
      task.progress += Math.random() * 20;

      if (task.progress >= 100) {
        task.progress = 100;
        task.status = 'completed';
        task.endTime = new Date();
        task.actualDuration = Math.floor((task.endTime.getTime() - task.startTime!.getTime()) / (1000 * 60));

        // Generate results
        task.results = {
          performanceGain: Math.random() * 50 + 10,
          spaceSaved: Math.random() * 100,
          queriesImproved: Math.floor(Math.random() * 20)
        };

        clearInterval(interval);
      }

      this._tasks.set([...tasks]);
      this.updateMetrics();
    }, 1000);
  }

  /**
   * Get database metrics
   */
  getMetrics(): DatabaseMetrics {
    return this._metrics();
  }

  /**
   * Generate optimization report
   */
  generateOptimizationReport(): any {
    const indexes = this._indexes();
    const queries = this._queries();
    const tables = this._tables();
    const tasks = this._tasks();

    const report = {
      summary: {
        totalTables: tables.length,
        totalIndexes: indexes.length,
        totalQueries: queries.length,
        slowQueries: queries.filter(q => q.executionTime > 1000).length,
        missingIndexes: this.calculateMissingIndexes(queries, indexes),
        averageFragmentation: tables.reduce((sum, t) => sum + t.fragmentation, 0) / tables.length,
        performanceScore: this.calculatePerformanceScore(indexes, queries, tables)
      },
      recommendations: this.generateOptimizationRecommendations(indexes, queries, tables),
      tasks: tasks.filter(t => t.status === 'completed').slice(-10),
      generatedAt: new Date()
    };

    return report;
  }

  /**
   * Generate index recommendations
   */
  private generateIndexRecommendations(index: DatabaseIndex): string[] {
    const recommendations: string[] = [];

    if (index.usage.efficiency < 50) {
      recommendations.push('Consider dropping this index as it has low usage efficiency');
    }
    if (index.performance.queryTime > 100) {
      recommendations.push('Index query time is high, consider optimizing the query');
    }
    if (index.performance.scanCount > 50) {
      recommendations.push('High scan count detected, consider adding covering columns');
    }
    if (index.size > 1000) {
      recommendations.push('Index size is large, consider partitioning or archiving old data');
    }

    return recommendations;
  }

  /**
   * Generate query recommendations
   */
  private generateQueryRecommendations(query: QueryPerformance): string[] {
    const recommendations: string[] = [];

    if (query.executionTime > 1000) {
      recommendations.push('Query execution time is high, consider adding indexes');
    }
    if (query.rowsExamined > query.rowsReturned * 10) {
      recommendations.push('Query examines too many rows, consider adding WHERE clauses');
    }
    if (!query.indexUsed) {
      recommendations.push('No index used, consider adding appropriate indexes');
    }
    if (query.frequency > 100) {
      recommendations.push('High frequency query, consider caching results');
    }

    return recommendations;
  }

  /**
   * Calculate missing indexes
   */
  private calculateMissingIndexes(queries: QueryPerformance[], indexes: DatabaseIndex[]): number {
    return queries.filter(q => !q.indexUsed && q.executionTime > 500).length;
  }

  /**
   * Calculate performance score
   */
  private calculatePerformanceScore(indexes: DatabaseIndex[], queries: QueryPerformance[], tables: TableStatistics[]): number {
    const indexEfficiency = indexes.reduce((sum, i) => sum + i.usage.efficiency, 0) / Math.max(indexes.length, 1);
    const queryEfficiency = queries.filter(q => q.executionTime < 1000).length / Math.max(queries.length, 1) * 100;
    const fragmentationScore = 100 - (tables.reduce((sum, t) => sum + t.fragmentation, 0) / Math.max(tables.length, 1));

    return (indexEfficiency + queryEfficiency + fragmentationScore) / 3;
  }

  /**
   * Generate optimization recommendations
   */
  private generateOptimizationRecommendations(indexes: DatabaseIndex[], queries: QueryPerformance[], tables: TableStatistics[]): string[] {
    const recommendations: string[] = [];

    const slowQueries = queries.filter(q => q.executionTime > 1000);
    if (slowQueries.length > 0) {
      recommendations.push(`Optimize ${slowQueries.length} slow queries`);
    }

    const fragmentedTables = tables.filter(t => t.fragmentation > 30);
    if (fragmentedTables.length > 0) {
      recommendations.push(`Optimize ${fragmentedTables.length} fragmented tables`);
    }

    const unusedIndexes = indexes.filter(i => i.usage.efficiency < 20);
    if (unusedIndexes.length > 0) {
      recommendations.push(`Consider dropping ${unusedIndexes.length} unused indexes`);
    }

    const missingIndexes = this.calculateMissingIndexes(queries, indexes);
    if (missingIndexes > 0) {
      recommendations.push(`Add ${missingIndexes} missing indexes`);
    }

    return recommendations;
  }

  /**
   * Update metrics
   */
  private updateMetrics(): void {
    const indexes = this._indexes();
    const queries = this._queries();
    const tables = this._tables();
    const tasks = this._tasks();
    const metrics = this.calculateMetrics(indexes, queries, tables, tasks);
    this._metrics.set(metrics);
  }

  /**
   * Calculate metrics
   */
  private calculateMetrics(indexes: DatabaseIndex[], queries: QueryPerformance[], tables: TableStatistics[], tasks: OptimizationTask[]): DatabaseMetrics {
    const totalTables = tables.length;
    const totalIndexes = indexes.length;
    const totalSize = tables.reduce((sum, t) => sum + t.size, 0);
    const averageFragmentation = tables.reduce((sum, t) => sum + t.fragmentation, 0) / Math.max(tables.length, 1);
    const slowQueries = queries.filter(q => q.executionTime > 1000).length;
    const missingIndexes = this.calculateMissingIndexes(queries, indexes);
    const optimizationTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const performanceScore = this.calculatePerformanceScore(indexes, queries, tables);
    const spaceUtilization = totalSize > 0 ? (tables.reduce((sum, t) => sum + t.dataSize, 0) / totalSize) * 100 : 0;
    const queryEfficiency = queries.length > 0 ? (queries.filter(q => q.executionTime < 1000).length / queries.length) * 100 : 100;
    const indexEfficiency = indexes.length > 0 ? indexes.reduce((sum, i) => sum + i.usage.efficiency, 0) / indexes.length : 100;
    const lastOptimization = tasks.filter(t => t.status === 'completed').sort((a, b) => b.endTime!.getTime() - a.endTime!.getTime())[0]?.endTime || new Date();
    const nextScheduledOptimization = new Date(Date.now() + 24 * 60 * 60 * 1000); // Next day

    return {
      totalTables,
      totalIndexes,
      totalSize,
      averageFragmentation,
      slowQueries,
      missingIndexes,
      optimizationTasks,
      completedTasks,
      performanceScore,
      spaceUtilization,
      queryEfficiency,
      indexEfficiency,
      lastOptimization,
      nextScheduledOptimization
    };
  }

  /**
   * Get default metrics
   */
  private getDefaultMetrics(): DatabaseMetrics {
    return {
      totalTables: 0,
      totalIndexes: 0,
      totalSize: 0,
      averageFragmentation: 0,
      slowQueries: 0,
      missingIndexes: 0,
      optimizationTasks: 0,
      completedTasks: 0,
      performanceScore: 0,
      spaceUtilization: 0,
      queryEfficiency: 0,
      indexEfficiency: 0,
      lastOptimization: new Date(),
      nextScheduledOptimization: new Date()
    };
  }

  /**
   * Initialize demo data
   */
  private initializeDemoData(): void {
    // Create demo indexes
    const demoIndexes: DatabaseIndex[] = [
      {
        id: 'index-1',
        name: 'idx_users_email',
        table: 'users',
        columns: ['email'],
        type: 'unique',
        isUnique: true,
        isActive: true,
        size: 2.5,
        usage: {
          reads: 1500,
          writes: 50,
          lastUsed: new Date(),
          efficiency: 95
        },
        performance: {
          queryTime: 15,
          scanCount: 1,
          logicalReads: 3,
          physicalReads: 0
        },
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastAnalyzed: new Date(),
        recommendations: []
      },
      {
        id: 'index-2',
        name: 'idx_events_timestamp',
        table: 'events',
        columns: ['timestamp', 'type'],
        type: 'index',
        isUnique: false,
        isActive: true,
        size: 15.8,
        usage: {
          reads: 800,
          writes: 200,
          lastUsed: new Date(),
          efficiency: 78
        },
        performance: {
          queryTime: 45,
          scanCount: 5,
          logicalReads: 25,
          physicalReads: 2
        },
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        lastAnalyzed: new Date(),
        recommendations: []
      }
    ];

    this._indexes.set(demoIndexes);

    // Create demo queries
    const demoQueries: QueryPerformance[] = [
      {
        id: 'query-1',
        query: 'SELECT * FROM users WHERE email = ?',
        table: 'users',
        executionTime: 12,
        rowsExamined: 1,
        rowsReturned: 1,
        indexUsed: 'idx_users_email',
        isOptimized: true,
        frequency: 500,
        lastExecuted: new Date(),
        recommendations: [],
        cost: 1
      },
      {
        id: 'query-2',
        query: 'SELECT * FROM events WHERE timestamp > ? AND type = ?',
        table: 'events',
        executionTime: 1200,
        rowsExamined: 50000,
        rowsReturned: 100,
        indexUsed: 'idx_events_timestamp',
        isOptimized: false,
        frequency: 100,
        lastExecuted: new Date(),
        recommendations: [],
        cost: 5
      }
    ];

    this._queries.set(demoQueries);

    // Create demo tables
    const demoTables: TableStatistics[] = [
      {
        id: 'table-1',
        name: 'users',
        rows: 10000,
        size: 25.5,
        indexSize: 5.2,
        dataSize: 20.3,
        fragmentation: 15,
        lastAnalyzed: new Date(),
        growthRate: 50,
        accessPattern: {
          reads: 5000,
          writes: 200,
          updates: 100,
          deletes: 10
        },
        indexes: demoIndexes.filter(i => i.table === 'users'),
        performance: {
          averageQueryTime: 25,
          slowQueries: 2,
          missingIndexes: 0
        }
      },
      {
        id: 'table-2',
        name: 'events',
        rows: 1000000,
        size: 250.8,
        indexSize: 45.2,
        dataSize: 205.6,
        fragmentation: 35,
        lastAnalyzed: new Date(),
        growthRate: 1000,
        accessPattern: {
          reads: 20000,
          writes: 5000,
          updates: 1000,
          deletes: 100
        },
        indexes: demoIndexes.filter(i => i.table === 'events'),
        performance: {
          averageQueryTime: 150,
          slowQueries: 15,
          missingIndexes: 3
        }
      }
    ];

    this._tables.set(demoTables);

    // Create demo tasks
    const demoTasks: OptimizationTask[] = [
      {
        id: 'task-1',
        name: 'Optimize events table',
        type: 'table_optimization',
        status: 'completed',
        priority: 'high',
        description: 'Optimize events table to reduce fragmentation',
        affectedTables: ['events'],
        estimatedDuration: 15,
        actualDuration: 12,
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 12 * 60 * 1000),
        progress: 100,
        results: {
          performanceGain: 25,
          spaceSaved: 15.5,
          queriesImproved: 8
        },
        createdBy: 'admin',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
      }
    ];

    this._tasks.set(demoTasks);
    this.updateMetrics();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'db-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}
