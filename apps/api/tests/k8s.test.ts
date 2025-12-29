import { describe, it, expect, beforeAll } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('Kubernetes Deployment', () => {
  describe('Deployment Configuration', () => {
    it('should have valid deployment YAML', async () => {
      const { stdout } = await execAsync('kubectl apply --dry-run=client -f k8s/deployment.yaml');
      expect(stdout).toContain('configured');
    });

    it('should define web deployment', async () => {
      const { stdout } = await execAsync('kubectl get deployment toy-marketplace-web --dry-run=client -o yaml');
      expect(stdout).toContain('toy-marketplace-web');
    });

    it('should define API deployment', async () => {
      const { stdout } = await execAsync('kubectl get deployment toy-marketplace-api --dry-run=client -o yaml');
      expect(stdout).toContain('toy-marketplace-api');
    });

    it('should have 3 replicas for web', async () => {
      const { stdout } = await execAsync('kubectl get deployment toy-marketplace-web -o jsonpath="{.spec.replicas}"');
      expect(stdout).toBe('3');
    });

    it('should have 3 replicas for API', async () => {
      const { stdout } = await execAsync('kubectl get deployment toy-marketplace-api -o jsonpath="{.spec.replicas}"');
      expect(stdout).toBe('3');
    });
  });

  describe('Service Configuration', () => {
    it('should have LoadBalancer service for web', async () => {
      const { stdout } = await execAsync('kubectl get service toy-marketplace-web -o jsonpath="{.spec.type}"');
      expect(stdout).toBe('LoadBalancer');
    });

    it('should have LoadBalancer service for API', async () => {
      const { stdout } = await execAsync('kubectl get service toy-marketplace-api -o jsonpath="{.spec.type}"');
      expect(stdout).toBe('LoadBalancer');
    });

    it('should expose port 80 for web', async () => {
      const { stdout } = await execAsync('kubectl get service toy-marketplace-web -o jsonpath="{.spec.ports[0].port}"');
      expect(stdout).toBe('80');
    });

    it('should expose port 80 for API', async () => {
      const { stdout } = await execAsync('kubectl get service toy-marketplace-api -o jsonpath="{.spec.ports[0].port}"');
      expect(stdout).toBe('80');
    });
  });

  describe('Ingress Configuration', () => {
    it('should have valid ingress YAML', async () => {
      const { stdout } = await execAsync('kubectl apply --dry-run=client -f k8s/ingress.yaml');
      expect(stdout).toContain('configured');
    });

    it('should define ingress rules', async () => {
      const { stdout } = await execAsync('kubectl get ingress toy-marketplace-ingress -o yaml');
      expect(stdout).toContain('toymarketplace.in');
      expect(stdout).toContain('api.toymarketplace.in');
    });

    it('should have TLS configuration', async () => {
      const { stdout } = await execAsync('kubectl get ingress toy-marketplace-ingress -o jsonpath="{.spec.tls}"');
      expect(stdout).toContain('toy-marketplace-tls');
    });

    it('should force HTTPS redirect', async () => {
      const { stdout } = await execAsync('kubectl get ingress toy-marketplace-ingress -o yaml');
      expect(stdout).toContain('ssl-redirect');
    });
  });

  describe('HorizontalPodAutoscaler', () => {
    it('should have HPA for web', async () => {
      const { stdout } = await execAsync('kubectl get hpa toy-marketplace-web-hpa -o yaml');
      expect(stdout).toContain('toy-marketplace-web-hpa');
    });

    it('should have HPA for API', async () => {
      const { stdout } = await execAsync('kubectl get hpa toy-marketplace-api-hpa -o yaml');
      expect(stdout).toContain('toy-marketplace-api-hpa');
    });

    it('should scale between 3-10 replicas for web', async () => {
      const { stdout: min } = await execAsync('kubectl get hpa toy-marketplace-web-hpa -o jsonpath="{.spec.minReplicas}"');
      const { stdout: max } = await execAsync('kubectl get hpa toy-marketplace-web-hpa -o jsonpath="{.spec.maxReplicas}"');
      
      expect(min).toBe('3');
      expect(max).toBe('10');
    });

    it('should scale based on CPU and memory', async () => {
      const { stdout } = await execAsync('kubectl get hpa toy-marketplace-web-hpa -o yaml');
      expect(stdout).toContain('cpu');
      expect(stdout).toContain('memory');
    });
  });

  describe('Secrets', () => {
    it('should have secrets defined', async () => {
      const { stdout } = await execAsync('kubectl get secret toy-marketplace-secrets -o yaml');
      expect(stdout).toContain('toy-marketplace-secrets');
    });

    it('should have database URL secret', async () => {
      const { stdout } = await execAsync('kubectl get secret toy-marketplace-secrets -o jsonpath="{.data.database-url}"');
      expect(stdout).toBeTruthy();
    });

    it('should have JWT secret', async () => {
      const { stdout } = await execAsync('kubectl get secret toy-marketplace-secrets -o jsonpath="{.data.jwt-secret}"');
      expect(stdout).toBeTruthy();
    });
  });

  describe('Resource Limits', () => {
    it('should have resource requests for web', async () => {
      const { stdout } = await execAsync('kubectl get deployment toy-marketplace-web -o jsonpath="{.spec.template.spec.containers[0].resources.requests}"');
      expect(stdout).toContain('memory');
      expect(stdout).toContain('cpu');
    });

    it('should have resource limits for web', async () => {
      const { stdout } = await execAsync('kubectl get deployment toy-marketplace-web -o jsonpath="{.spec.template.spec.containers[0].resources.limits}"');
      expect(stdout).toContain('memory');
      expect(stdout).toContain('cpu');
    });

    it('should have resource requests for API', async () => {
      const { stdout } = await execAsync('kubectl get deployment toy-marketplace-api -o jsonpath="{.spec.template.spec.containers[0].resources.requests}"');
      expect(stdout).toContain('memory');
      expect(stdout).toContain('cpu');
    });

    it('should have resource limits for API', async () => {
      const { stdout } = await execAsync('kubectl get deployment toy-marketplace-api -o jsonpath="{.spec.template.spec.containers[0].resources.limits}"');
      expect(stdout).toContain('memory');
      expect(stdout).toContain('cpu');
    });
  });

  describe('Health Checks', () => {
    it('should have liveness probe for web', async () => {
      const { stdout } = await execAsync('kubectl get deployment toy-marketplace-web -o jsonpath="{.spec.template.spec.containers[0].livenessProbe}"');
      expect(stdout).toContain('httpGet');
    });

    it('should have readiness probe for web', async () => {
      const { stdout } = await execAsync('kubectl get deployment toy-marketplace-web -o jsonpath="{.spec.template.spec.containers[0].readinessProbe}"');
      expect(stdout).toContain('httpGet');
    });

    it('should have liveness probe for API', async () => {
      const { stdout } = await execAsync('kubectl get deployment toy-marketplace-api -o jsonpath="{.spec.template.spec.containers[0].livenessProbe}"');
      expect(stdout).toContain('httpGet');
      expect(stdout).toContain('/api/health');
    });

    it('should have readiness probe for API', async () => {
      const { stdout } = await execAsync('kubectl get deployment toy-marketplace-api -o jsonpath="{.spec.template.spec.containers[0].readinessProbe}"');
      expect(stdout).toContain('httpGet');
      expect(stdout).toContain('/api/health');
    });
  });

  describe('Labels and Selectors', () => {
    it('should have correct labels for web', async () => {
      const { stdout } = await execAsync('kubectl get deployment toy-marketplace-web -o jsonpath="{.metadata.labels}"');
      expect(stdout).toContain('toy-marketplace');
      expect(stdout).toContain('web');
    });

    it('should have correct labels for API', async () => {
      const { stdout } = await execAsync('kubectl get deployment toy-marketplace-api -o jsonpath="{.metadata.labels}"');
      expect(stdout).toContain('toy-marketplace');
      expect(stdout).toContain('api');
    });

    it('should have matching selectors', async () => {
      const { stdout: webSelector } = await execAsync('kubectl get deployment toy-marketplace-web -o jsonpath="{.spec.selector.matchLabels}"');
      const { stdout: webLabels } = await execAsync('kubectl get deployment toy-marketplace-web -o jsonpath="{.spec.template.metadata.labels}"');
      
      expect(webSelector).toBe(webLabels);
    });
  });
});

describe('Docker Configuration', () => {
  describe('Web Dockerfile', () => {
    it('should build web image successfully', async () => {
      const { stdout } = await execAsync('docker build -f apps/web/Dockerfile -t toymarketplace/web:test .');
      expect(stdout).toContain('Successfully built');
    });

    it('should use multi-stage build', async () => {
      const { stdout } = await execAsync('cat apps/web/Dockerfile');
      expect(stdout).toContain('AS web-builder');
      expect(stdout).toContain('AS web-runner');
    });

    it('should use Node 20 Alpine', async () => {
      const { stdout } = await execAsync('cat apps/web/Dockerfile');
      expect(stdout).toContain('node:20-alpine');
    });
  });

  describe('API Dockerfile', () => {
    it('should build API image successfully', async () => {
      const { stdout } = await execAsync('docker build -f apps/api/Dockerfile -t toymarketplace/api:test .');
      expect(stdout).toContain('Successfully built');
    });

    it('should use multi-stage build', async () => {
      const { stdout } = await execAsync('cat apps/api/Dockerfile');
      expect(stdout).toContain('AS api-builder');
      expect(stdout).toContain('AS api-runner');
    });

    it('should expose port 3001', async () => {
      const { stdout } = await execAsync('cat apps/api/Dockerfile');
      expect(stdout).toContain('EXPOSE 3001');
    });
  });

  describe('Docker Compose', () => {
    it('should have valid docker-compose.yml', async () => {
      const { stdout } = await execAsync('docker-compose config');
      expect(stdout).toContain('services');
    });

    it('should define postgres service', async () => {
      const { stdout } = await execAsync('docker-compose config');
      expect(stdout).toContain('postgres');
    });

    it('should define redis service', async () => {
      const { stdout } = await execAsync('docker-compose config');
      expect(stdout).toContain('redis');
    });

    it('should define web service', async () => {
      const { stdout } = await execAsync('docker-compose config');
      expect(stdout).toContain('web');
    });

    it('should define API service', async () => {
      const { stdout } = await execAsync('docker-compose config');
      expect(stdout).toContain('api');
    });

    it('should have health checks', async () => {
      const { stdout } = await execAsync('docker-compose config');
      expect(stdout).toContain('healthcheck');
    });

    it('should have volume persistence', async () => {
      const { stdout } = await execAsync('docker-compose config');
      expect(stdout).toContain('volumes');
      expect(stdout).toContain('postgres_data');
      expect(stdout).toContain('redis_data');
    });
  });
});
