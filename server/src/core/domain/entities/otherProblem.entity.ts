export default class OtherProblem {
    constructor (
        public id: number,
        public time: string,
        public date: string,
        public description_problem: string,
        public userId?: number
    ) {}

    setProblem(problem: string) {
        this.description_problem = problem;
        return this;
    }
}