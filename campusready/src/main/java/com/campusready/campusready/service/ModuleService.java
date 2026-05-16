package com.campusready.campusready.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.campusready.campusready.entity.Module;
import com.campusready.campusready.repository.ModuleRepository;

@Service
public class ModuleService {

    private final ModuleRepository moduleRepository;

    public ModuleService(ModuleRepository moduleRepository) {
        this.moduleRepository = moduleRepository;
    }

    public Module createModule(Module module) {
        return moduleRepository.save(module);
    }

    public List<Module> getAllModules() {
        return moduleRepository.findAll();
    }

    public Module updateModule(Long id, Module moduleUpdate) {
        Optional<Module> existing = moduleRepository.findById(id);
        if (existing.isEmpty()) {
            return null;
        }

        Module module = existing.get();
        module.setTitle(moduleUpdate.getTitle());
        module.setDescription(moduleUpdate.getDescription());
        module.setDisasterType(moduleUpdate.getDisasterType());
        module.setContent(moduleUpdate.getContent());

        return moduleRepository.save(module);
    }

    public void deleteModule(Long id) {
        moduleRepository.deleteById(id);
    }
}
