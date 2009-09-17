function Assessment(activity)
{
    this.activity = activity;
    this.grader = new Grader(activity);
    this.log = [];
    this.results = [];
}
