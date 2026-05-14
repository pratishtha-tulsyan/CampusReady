package com.campusready.campusready.service;

import java.util.List;

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

    public void deleteModule(Long id) {
        moduleRepository.deleteById(id);
    }
}
