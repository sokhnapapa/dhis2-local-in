package org.hisp.dhis.scheduler;

import java.util.Date;

import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

public class HelloJob implements Job
{
    public void execute( JobExecutionContext arg0 ) throws JobExecutionException
    {
        System.out.println("Hello World Quartz Scheduler: " + new Date());
    }
}
