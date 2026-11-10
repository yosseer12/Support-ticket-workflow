package com.yosr.tickets.web;

import com.yosr.tickets.model.Ticket;
import com.yosr.tickets.service.TicketService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.camunda.bpm.engine.TaskService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api")
public class TicketController {

    public record CreateTicketRequest(@NotBlank String title, String description, Ticket.Priority priority) {}
    public record TaskDto(String id, String name, String assignee, Long ticketId) {}

    private final TicketService ticketService;
    private final TaskService taskService;

    public TicketController(TicketService ticketService, TaskService taskService) {
        this.ticketService = ticketService;
        this.taskService = taskService;
    }

    @PostMapping("/tickets")
    @ResponseStatus(HttpStatus.CREATED)
    public Ticket create(@Valid @RequestBody CreateTicketRequest request) {
        return ticketService.create(request.title(), request.description(), request.priority());
    }

    @GetMapping("/tickets")
    public List<Ticket> list() {
        return ticketService.findAll();
    }

    /** Open tasks for a Camunda candidate group: support-agents, senior-agents or admins. */
    @GetMapping("/tasks")
    public List<TaskDto> tasks(@RequestParam String group) {
        return taskService.createTaskQuery().taskCandidateGroup(group).active().list().stream()
                .map(t -> new TaskDto(t.getId(), t.getName(), t.getAssignee(),
                        (Long) taskService.getVariable(t.getId(), "ticketId")))
                .toList();
    }

    @PostMapping("/tasks/{id}/claim")
    public void claim(@PathVariable String id, Principal principal) {
        taskService.claim(id, principal.getName());
        Long ticketId = (Long) taskService.getVariable(id, "ticketId");
        ticketService.markInProgress(ticketId);
    }

    @PostMapping("/tasks/{id}/complete")
    public void complete(@PathVariable String id) {
        taskService.complete(id);
    }
}
