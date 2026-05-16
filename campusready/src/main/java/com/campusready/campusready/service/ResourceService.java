package com.campusready.campusready.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.campusready.campusready.entity.Resource;
import com.campusready.campusready.repository.ResourceRepository;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public Resource createResource(Resource resource) {
        if (resource.getCreatedAt() == null) {
            resource.setCreatedAt(LocalDateTime.now());
        }
        return resourceRepository.save(resource);
    }

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public List<Resource> getResourcesByCategory(String category) {
        return resourceRepository.findByCategoryIgnoreCase(category);
    }

    public Resource updateResource(Long id, Resource resourceUpdate) {
        Optional<Resource> existing = resourceRepository.findById(id);
        if (existing.isEmpty()) {
            return null;
        }

        Resource resource = existing.get();
        resource.setTitle(resourceUpdate.getTitle());
        resource.setDescription(resourceUpdate.getDescription());
        resource.setCategory(resourceUpdate.getCategory());
        resource.setResourceType(resourceUpdate.getResourceType());
        resource.setLinkOrContent(resourceUpdate.getLinkOrContent());

        return resourceRepository.save(resource);
    }

    public void deleteResource(Long id) {
        resourceRepository.deleteById(id);
    }
}
