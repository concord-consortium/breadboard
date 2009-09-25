function Assessment(activity, log)
{
    //console.log('ENTER Assessment');
    this.activity = activity;
    this.log = log;
    this.grader = new Grader(activity);
}

Assessment.prototype =
{
    activity : null,
    log : null,
    grader : null,
    results : []
}
