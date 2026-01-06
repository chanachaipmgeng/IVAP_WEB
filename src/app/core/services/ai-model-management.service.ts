import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';

export interface AIModel {
  id: string;
  name: string;
  type: 'yolo' | 'tensorflow' | 'pytorch' | 'onnx' | 'custom';
  version: string;
  framework: 'yolov8' | 'yolov5' | 'tensorflow' | 'pytorch' | 'onnx' | 'custom';
  purpose: 'object_detection' | 'face_recognition' | 'safety_detection' | 'anomaly_detection' | 'classification' | 'segmentation';
  status: 'active' | 'inactive' | 'training' | 'deploying' | 'error' | 'maintenance';
  accuracy: number; // percentage
  confidence: number; // 0-1
  size: number; // in MB
  lastTrained: Date;
  lastDeployed: Date;
  performance: {
    inferenceTime: number; // in milliseconds
    memoryUsage: number; // in MB
    cpuUsage: number; // percentage
    gpuUsage: number; // percentage
    throughput: number; // predictions per second
  };
  metadata: {
    classes: string[];
    inputSize: { width: number; height: number; channels: number };
    outputFormat: string;
    preprocessing: string[];
    postprocessing: string[];
    requirements: string[];
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModelTrainingJob {
  id: string;
  modelId: string;
  name: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  dataset: {
    name: string;
    size: number;
    classes: string[];
    split: {
      train: number;
      validation: number;
      test: number;
    };
  };
  hyperparameters: {
    epochs: number;
    batchSize: number;
    learningRate: number;
    optimizer: string;
    lossFunction: string;
  };
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    loss: number;
  };
  logs: string[];
  error?: string;
  createdBy: string;
}

export interface ModelDeployment {
  id: string;
  modelId: string;
  environment: 'development' | 'staging' | 'production';
  status: 'deploying' | 'active' | 'inactive' | 'failed' | 'rolling_back';
  deployedAt: Date;
  version: string;
  endpoint: string;
  replicas: number;
  resources: {
    cpu: string;
    memory: string;
    gpu?: string;
  };
  health: {
    isHealthy: boolean;
    lastCheck: Date;
    responseTime: number;
    errorRate: number;
    uptime: number;
  };
  metrics: {
    requestsPerSecond: number;
    averageResponseTime: number;
    errorRate: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

export interface ModelMetrics {
  totalModels: number;
  activeModels: number;
  modelsByType: { [key: string]: number };
  modelsByPurpose: { [key: string]: number };
  modelsByStatus: { [key: string]: number };
  averageAccuracy: number;
  averageInferenceTime: number;
  totalTrainingJobs: number;
  activeTrainingJobs: number;
  totalDeployments: number;
  activeDeployments: number;
  averagePerformance: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface ModelConfiguration {
  id: string;
  name: string;
  modelId: string;
  environment: string;
  settings: {
    confidenceThreshold: number;
    nmsThreshold: number;
    maxDetections: number;
    inputSize: { width: number; height: number };
    batchSize: number;
    preprocessing: any;
    postprocessing: any;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AIModelManagementService {
  // ✅ Signals for reactive state
  private _models = signal<AIModel[]>([]);
  private _trainingJobs = signal<ModelTrainingJob[]>([]);
  private _deployments = signal<ModelDeployment[]>([]);
  private _configurations = signal<ModelConfiguration[]>([]);
  private _metrics = signal<ModelMetrics>(this.getDefaultMetrics());

  // ✅ Readonly signals for public access
  public readonly models = this._models.asReadonly();
  public readonly trainingJobs = this._trainingJobs.asReadonly();
  public readonly deployments = this._deployments.asReadonly();
  public readonly configurations = this._configurations.asReadonly();
  public readonly metrics = this._metrics.asReadonly();

  // ✅ Computed signals for derived state
  public readonly modelsCount = computed(() => this._models().length);
  public readonly activeModelsCount = computed(() =>
    this._models().filter(m => m.status === 'active').length
  );
  public readonly trainingJobsCount = computed(() => this._trainingJobs().length);
  public readonly runningTrainingJobsCount = computed(() =>
    this._trainingJobs().filter(j => j.status === 'running').length
  );
  public readonly deploymentsCount = computed(() => this._deployments().length);
  public readonly activeDeploymentsCount = computed(() =>
    this._deployments().filter(d => d.status === 'active').length
  );
  public readonly configurationsCount = computed(() => this._configurations().length);

  // ✅ Observable compatibility layer (for backward compatibility)
  public models$ = new Observable<AIModel[]>(observer => {
    observer.next(this._models());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public trainingJobs$ = new Observable<ModelTrainingJob[]>(observer => {
    observer.next(this._trainingJobs());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public deployments$ = new Observable<ModelDeployment[]>(observer => {
    observer.next(this._deployments());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public configurations$ = new Observable<ModelConfiguration[]>(observer => {
    observer.next(this._configurations());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public metrics$ = new Observable<ModelMetrics>(observer => {
    observer.next(this._metrics());
    // Note: This is a compatibility layer - prefer using signals directly
  });

  constructor() {
    this.initializeDemoData();
  }

  /**
   * Get all models
   */
  getModels(): AIModel[] {
    return this._models();
  }

  /**
   * Get model by ID
   */
  getModel(modelId: string): AIModel | undefined {
    return this._models().find(m => m.id === modelId);
  }

  /**
   * Create new model
   */
  createModel(model: Omit<AIModel, 'id' | 'createdAt' | 'updatedAt'>): AIModel {
    const newModel: AIModel = {
      ...model,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const models = this._models();
    this._models.set([...models, newModel]);
    this.updateMetrics();

    return newModel;
  }

  /**
   * Update model
   */
  updateModel(modelId: string, updates: Partial<AIModel>): void {
    const models = this._models();
    const index = models.findIndex(m => m.id === modelId);

    if (index !== -1) {
      models[index] = {
        ...models[index],
        ...updates,
        updatedAt: new Date()
      };
      this._models.set([...models]);
      this.updateMetrics();
    }
  }

  /**
   * Delete model
   */
  deleteModel(modelId: string): void {
    const models = this._models();
    this._models.set(models.filter(m => m.id !== modelId));
    this.updateMetrics();
  }

  /**
   * Start model training
   */
  startTraining(trainingJob: Omit<ModelTrainingJob, 'id' | 'startTime' | 'status' | 'progress' | 'logs'>): ModelTrainingJob {
    const newJob: ModelTrainingJob = {
      ...trainingJob,
      id: this.generateId(),
      startTime: new Date(),
      status: 'running',
      progress: 0,
      logs: ['Training job started', 'Initializing dataset...', 'Loading model architecture...']
    };

    const jobs = this._trainingJobs();
    this._trainingJobs.set([...jobs, newJob]);

    // Simulate training progress
    this.simulateTrainingProgress(newJob.id);

    return newJob;
  }

  /**
   * Stop training job
   */
  stopTraining(jobId: string): void {
    const jobs = this._trainingJobs();
    const job = jobs.find((j: ModelTrainingJob) => j.id === jobId);

    if (job && job.status === 'running') {
      job.status = 'cancelled';
      job.endTime = new Date();
      job.duration = this.calculateDuration(job.startTime, job.endTime);
      this._trainingJobs.set([...jobs]);
    }
  }

  /**
   * Get training jobs
   */
  getTrainingJobs(): ModelTrainingJob[] {
    return this._trainingJobs();
  }

  /**
   * Deploy model
   */
  deployModel(deployment: Omit<ModelDeployment, 'id' | 'deployedAt' | 'status' | 'health' | 'metrics'>): ModelDeployment {
    const newDeployment: ModelDeployment = {
      ...deployment,
      id: this.generateId(),
      deployedAt: new Date(),
      status: 'deploying',
      health: {
        isHealthy: true,
        lastCheck: new Date(),
        responseTime: 0,
        errorRate: 0,
        uptime: 100
      },
      metrics: {
        requestsPerSecond: 0,
        averageResponseTime: 0,
        errorRate: 0,
        memoryUsage: 0,
        cpuUsage: 0
      }
    };

    const deployments = this._deployments();
    this._deployments.set([...deployments, newDeployment]);

    // Simulate deployment
    setTimeout(() => {
      this.completeDeployment(newDeployment.id);
    }, 5000);

    return newDeployment;
  }

  /**
   * Get deployments
   */
  getDeployments(): ModelDeployment[] {
    return this._deployments();
  }

  /**
   * Update deployment
   */
  updateDeployment(deploymentId: string, updates: Partial<ModelDeployment>): void {
    const deployments = this._deployments();
    const index = deployments.findIndex(d => d.id === deploymentId);

    if (index !== -1) {
      deployments[index] = { ...deployments[index], ...updates };
      this._deployments.set([...deployments]);
    }
  }

  /**
   * Get model configurations
   */
  getConfigurations(): ModelConfiguration[] {
    return this._configurations();
  }

  /**
   * Create configuration
   */
  createConfiguration(config: Omit<ModelConfiguration, 'id' | 'createdAt' | 'updatedAt'>): ModelConfiguration {
    const newConfig: ModelConfiguration = {
      ...config,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const configs = this._configurations();
    this._configurations.set([...configs, newConfig]);

    return newConfig;
  }

  /**
   * Update configuration
   */
  updateConfiguration(configId: string, updates: Partial<ModelConfiguration>): void {
    const configs = this._configurations();
    const index = configs.findIndex(c => c.id === configId);

    if (index !== -1) {
      configs[index] = {
        ...configs[index],
        ...updates,
        updatedAt: new Date()
      };
      this._configurations.set([...configs]);
    }
  }

  /**
   * Get metrics
   */
  getMetrics(): ModelMetrics {
    return this._metrics();
  }

  /**
   * Generate model report
   */
  generateModelReport(options: {
    dateFrom: Date;
    dateTo: Date;
    modelIds?: string[];
    includeTraining?: boolean;
    includeDeployments?: boolean;
  }): any {
    const models = this.getModels();
    const trainingJobs = options.includeTraining ? this.getTrainingJobs() : [];
    const deployments = options.includeDeployments ? this.getDeployments() : [];

    const report = {
      period: {
        from: options.dateFrom,
        to: options.dateTo
      },
      summary: {
        totalModels: models.length,
        activeModels: models.filter(m => m.status === 'active').length,
        modelsByType: this.groupBy(models, 'type'),
        modelsByPurpose: this.groupBy(models, 'purpose'),
        averageAccuracy: this.calculateAverageAccuracy(models),
        averageInferenceTime: this.calculateAverageInferenceTime(models),
        totalTrainingJobs: trainingJobs.length,
        activeTrainingJobs: trainingJobs.filter(j => j.status === 'running').length,
        totalDeployments: deployments.length,
        activeDeployments: deployments.filter(d => d.status === 'active').length
      },
      models: models,
      trainingJobs: trainingJobs,
      deployments: deployments,
      generatedAt: new Date()
    };

    return report;
  }

  /**
   * Simulate training progress
   */
  private simulateTrainingProgress(jobId: string): void {
    const jobs = this._trainingJobs();
    const job = jobs.find((j: ModelTrainingJob) => j.id === jobId);

    if (!job) return;

    const progressInterval = setInterval(() => {
      const currentJob = this._trainingJobs().find(j => j.id === jobId);
      if (!currentJob || currentJob.status !== 'running') {
        clearInterval(progressInterval);
        return;
      }

      currentJob.progress += Math.random() * 10;
      if (currentJob.progress >= 100) {
        currentJob.progress = 100;
        currentJob.status = 'completed';
        currentJob.endTime = new Date();
        currentJob.duration = this.calculateDuration(currentJob.startTime, currentJob.endTime);
        currentJob.metrics = this.generateTrainingMetrics();
        currentJob.logs.push('Training completed successfully');
        clearInterval(progressInterval);
      } else {
        currentJob.logs.push(`Epoch ${Math.floor(currentJob.progress / 10)}: Loss = ${(Math.random() * 0.5 + 0.1).toFixed(4)}`);
      }

      this._trainingJobs.set([...this._trainingJobs()]);
    }, 2000);
  }

  /**
   * Complete deployment
   */
  private completeDeployment(deploymentId: string): void {
    const deployments = this._deployments();
    const deployment = deployments.find(d => d.id === deploymentId);

    if (deployment) {
      deployment.status = 'active';
      deployment.health = {
        isHealthy: true,
        lastCheck: new Date(),
        responseTime: Math.random() * 50 + 10,
        errorRate: Math.random() * 0.01,
        uptime: 99.9
      };
      deployment.metrics = {
        requestsPerSecond: Math.random() * 100 + 50,
        averageResponseTime: Math.random() * 100 + 50,
        errorRate: Math.random() * 0.02,
        memoryUsage: Math.random() * 500 + 200,
        cpuUsage: Math.random() * 30 + 10
      };
      this._deployments.set([...deployments]);
    }
  }

  /**
   * Calculate duration
   */
  private calculateDuration(startTime: Date, endTime: Date): number {
    return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
  }

  /**
   * Generate training metrics
   */
  private generateTrainingMetrics(): any {
    return {
      accuracy: Math.random() * 0.2 + 0.8, // 80-100%
      precision: Math.random() * 0.2 + 0.8,
      recall: Math.random() * 0.2 + 0.8,
      f1Score: Math.random() * 0.2 + 0.8,
      loss: Math.random() * 0.1 + 0.01
    };
  }

  /**
   * Calculate average accuracy
   */
  private calculateAverageAccuracy(models: AIModel[]): number {
    if (models.length === 0) return 0;
    const totalAccuracy = models.reduce((sum, m) => sum + m.accuracy, 0);
    return totalAccuracy / models.length;
  }

  /**
   * Calculate average inference time
   */
  private calculateAverageInferenceTime(models: AIModel[]): number {
    if (models.length === 0) return 0;
    const totalTime = models.reduce((sum, m) => sum + m.performance.inferenceTime, 0);
    return totalTime / models.length;
  }

  /**
   * Update metrics
   */
  private updateMetrics(): void {
    const models = this._models();
    const trainingJobs = this._trainingJobs();
    const deployments = this._deployments();
    const metrics = this.calculateMetrics(models, trainingJobs, deployments);
    this._metrics.set(metrics);
  }

  /**
   * Calculate metrics
   */
  private calculateMetrics(models: AIModel[], trainingJobs: ModelTrainingJob[], deployments: ModelDeployment[]): ModelMetrics {
    const totalModels = models.length;
    const activeModels = models.filter(m => m.status === 'active').length;
    const modelsByType = this.groupBy(models, 'type');
    const modelsByPurpose = this.groupBy(models, 'purpose');
    const modelsByStatus = this.groupBy(models, 'status');

    const averageAccuracy = this.calculateAverageAccuracy(models);
    const averageInferenceTime = this.calculateAverageInferenceTime(models);
    const totalTrainingJobs = trainingJobs.length;
    const activeTrainingJobs = trainingJobs.filter(j => j.status === 'running').length;
    const totalDeployments = deployments.length;
    const activeDeployments = deployments.filter(d => d.status === 'active').length;
    const averagePerformance = this.calculateAveragePerformance(models);
    const trend = this.calculateTrend(models);

    return {
      totalModels,
      activeModels,
      modelsByType,
      modelsByPurpose,
      modelsByStatus,
      averageAccuracy,
      averageInferenceTime,
      totalTrainingJobs,
      activeTrainingJobs,
      totalDeployments,
      activeDeployments,
      averagePerformance,
      trend
    };
  }

  /**
   * Calculate average performance
   */
  private calculateAveragePerformance(models: AIModel[]): number {
    if (models.length === 0) return 0;
    const totalPerformance = models.reduce((sum, m) => {
      return sum + (m.performance.throughput * m.accuracy / 100);
    }, 0);
    return totalPerformance / models.length;
  }

  /**
   * Calculate trend
   */
  private calculateTrend(models: AIModel[]): 'improving' | 'stable' | 'declining' {
    const avgAccuracy = this.calculateAverageAccuracy(models);

    if (avgAccuracy >= 90) return 'improving';
    if (avgAccuracy >= 80) return 'stable';
    return 'declining';
  }

  /**
   * Group array by property
   */
  private groupBy<T>(array: T[], property: keyof T): { [key: string]: number } {
    return array.reduce((groups, item) => {
      const key = String(item[property]);
      groups[key] = (groups[key] || 0) + 1;
      return groups;
    }, {} as { [key: string]: number });
  }

  /**
   * Get default metrics
   */
  private getDefaultMetrics(): ModelMetrics {
    return {
      totalModels: 0,
      activeModels: 0,
      modelsByType: {},
      modelsByPurpose: {},
      modelsByStatus: {},
      averageAccuracy: 0,
      averageInferenceTime: 0,
      totalTrainingJobs: 0,
      activeTrainingJobs: 0,
      totalDeployments: 0,
      activeDeployments: 0,
      averagePerformance: 0,
      trend: 'stable'
    };
  }

  /**
   * Initialize demo data
   */
  private initializeDemoData(): void {
    // Create demo models
    const demoModels: AIModel[] = [
      {
        id: 'model-1',
        name: 'YOLOv8 Safety Detection',
        type: 'yolo',
        version: '8.0.0',
        framework: 'yolov8',
        purpose: 'safety_detection',
        status: 'active',
        accuracy: 94.5,
        confidence: 0.85,
        size: 25.6,
        lastTrained: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lastDeployed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        performance: {
          inferenceTime: 45.2,
          memoryUsage: 512,
          cpuUsage: 65,
          gpuUsage: 85,
          throughput: 22.1
        },
        metadata: {
          classes: ['helmet', 'safety_vest', 'person', 'smoking', 'phone'],
          inputSize: { width: 640, height: 640, channels: 3 },
          outputFormat: 'bounding_boxes',
          preprocessing: ['resize', 'normalize'],
          postprocessing: ['nms', 'confidence_filter'],
          requirements: ['opencv', 'numpy', 'torch']
        },
        isActive: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'model-2',
        name: 'Face Recognition v2.1',
        type: 'tensorflow',
        version: '2.1.0',
        framework: 'tensorflow',
        purpose: 'face_recognition',
        status: 'active',
        accuracy: 98.2,
        confidence: 0.92,
        size: 15.8,
        lastTrained: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        lastDeployed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        performance: {
          inferenceTime: 28.7,
          memoryUsage: 256,
          cpuUsage: 45,
          gpuUsage: 60,
          throughput: 34.8
        },
        metadata: {
          classes: ['face'],
          inputSize: { width: 224, height: 224, channels: 3 },
          outputFormat: 'embeddings',
          preprocessing: ['resize', 'normalize', 'face_detection'],
          postprocessing: ['l2_normalize'],
          requirements: ['tensorflow', 'opencv', 'face_recognition']
        },
        isActive: true,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ];

    this._models.set(demoModels);

    // Create demo training jobs
    const demoTrainingJobs: ModelTrainingJob[] = [
      {
        id: 'training-1',
        modelId: 'model-1',
        name: 'YOLOv8 Safety Detection Training',
        status: 'completed',
        progress: 100,
        startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        duration: 1440, // 24 hours
        dataset: {
          name: 'Safety Detection Dataset v3.0',
          size: 50000,
          classes: ['helmet', 'safety_vest', 'person', 'smoking', 'phone'],
          split: { train: 70, validation: 20, test: 10 }
        },
        hyperparameters: {
          epochs: 100,
          batchSize: 16,
          learningRate: 0.001,
          optimizer: 'AdamW',
          lossFunction: 'YOLOv8Loss'
        },
        metrics: {
          accuracy: 94.5,
          precision: 92.8,
          recall: 96.2,
          f1Score: 94.4,
          loss: 0.0234
        },
        logs: [
          'Training job started',
          'Dataset loaded: 50,000 images',
          'Model architecture initialized',
          'Training completed successfully'
        ],
        createdBy: 'data-scientist-1'
      }
    ];

    this._trainingJobs.set(demoTrainingJobs);

    // Create demo deployments
    const demoDeployments: ModelDeployment[] = [
      {
        id: 'deployment-1',
        modelId: 'model-1',
        environment: 'production',
        status: 'active',
        deployedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        version: '1.0.0',
        endpoint: 'https://api.company.com/v1/safety-detection',
        replicas: 3,
        resources: {
          cpu: '2',
          memory: '4Gi',
          gpu: '1'
        },
        health: {
          isHealthy: true,
          lastCheck: new Date(),
          responseTime: 45.2,
          errorRate: 0.001,
          uptime: 99.9
        },
        metrics: {
          requestsPerSecond: 150,
          averageResponseTime: 45.2,
          errorRate: 0.001,
          memoryUsage: 512,
          cpuUsage: 65
        }
      }
    ];

    this._deployments.set(demoDeployments);

    // Create demo configurations
    const demoConfigurations: ModelConfiguration[] = [
      {
        id: 'config-1',
        name: 'Production Safety Detection Config',
        modelId: 'model-1',
        environment: 'production',
        settings: {
          confidenceThreshold: 0.85,
          nmsThreshold: 0.5,
          maxDetections: 100,
          inputSize: { width: 640, height: 640 },
          batchSize: 1,
          preprocessing: {
            resize: true,
            normalize: true
          },
          postprocessing: {
            nms: true,
            confidenceFilter: true
          }
        },
        isActive: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ];

    this._configurations.set(demoConfigurations);
    this.updateMetrics();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'ai-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}

