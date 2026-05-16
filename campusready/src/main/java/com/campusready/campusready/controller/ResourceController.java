package com.campusready.campusready.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.campusready.campusready.entity.Resource;
import com.campusready.campusready.service.ResourceService;

@RestController
@RequestMapping("/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @PostMapping("/create")
    public Resource createResource(@RequestBody Resource resource) {
        return resourceService.createResource(resource);
    }

    @GetMapping("/")
    public List<Resource> getAllResources() {
        return resourceService.getAllResources();
    }

    @GetMapping("/category/{category}")
    public List<Resource> getResourcesByCategory(@PathVariable String category) {
        return resourceService.getResourcesByCategory(category);
    }

    @PutMapping("/{id}")
    public Resource updateResource(@PathVariable Long id, @RequestBody Resource resource) {
        Resource updated = resourceService.updateResource(id, resource);
        if (updated == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found");
        }
        return updated;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
    }
}
