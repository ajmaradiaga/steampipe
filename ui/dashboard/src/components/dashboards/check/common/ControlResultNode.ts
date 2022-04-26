import {
  CheckNodeStatus,
  CheckNodeType,
  CheckSummary,
  CheckNode,
  CheckResult,
} from "./index";

class ControlResultNode implements CheckNode {
  private readonly _result: CheckResult;

  constructor(result: CheckResult) {
    this._result = result;
  }

  get name(): string {
    return this._result.resource;
  }

  get title(): string {
    return this._result.reason;
  }

  get result(): CheckResult {
    return this._result;
  }

  get type(): CheckNodeType {
    return "result";
  }

  get summary(): CheckSummary {
    const summary = {
      alarm: 0,
      ok: 0,
      info: 0,
      skip: 0,
      error: 0,
    };
    if (this._result.status === "alarm") {
      summary.alarm += 1;
    }
    if (this._result.status === "error") {
      summary.error += 1;
    }
    if (this._result.status === "ok") {
      summary.ok += 1;
    }
    if (this._result.status === "info") {
      summary.info += 1;
    }
    if (this._result.status === "skip") {
      summary.skip += 1;
    }
    return summary;
  }

  get status(): CheckNodeStatus {
    return this._result.control.status;
  }
}

export default ControlResultNode;
