package com.campusready.campusready.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campusready.campusready.entity.Module;
import com.campusready.campusready.service.ModuleService;

@RestController
@RequestMapping("/modules")
public class ModuleController {

    private final ModuleService moduleService;

    public ModuleController(ModuleService moduleService) {
        this.moduleService = moduleService;
    }

    @PostMapping("/create")
    public Module createModule(@RequestBody Module module) {
        return moduleService.createModule(module);
    }

    @GetMapping("/")
    public List<Module> getAllModules() {
        return moduleService.getAllModules();
    }

    @DeleteMapping("/{id}")
    public void deleteModule(@PathVariable Long id) {
        moduleService.deleteModule(id);
    }
}
